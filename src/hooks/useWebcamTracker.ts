import { useCallback, useEffect, useRef, useState } from 'react';
import { LimbId, WebcamMapping, WebcamTrackingState } from '../types';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

export function getDefaultMappingsForLimb(limbId: LimbId): WebcamMapping[] {
  const isScaleSupported = ['snout', 'head', 'body'].includes(limbId);
  return [
    {
      limbId,
      parameter: 'rotation',
      source: 'handRotation',
      invert: false,
      multiplier: 1.0,
    },
    {
      limbId,
      parameter: 'x',
      source: 'handX',
      invert: false,
      multiplier: 35,
    },
    {
      limbId,
      parameter: 'y',
      source: 'handY',
      invert: false,
      multiplier: 30,
    },
    ...(isScaleSupported
      ? [
          {
            limbId,
            parameter: 'scaleY' as const,
            source: 'handPinch' as const,
            invert: false,
            multiplier: 0.6,
          },
        ]
      : []),
  ];
}

export const DEFAULT_WEBCAM_MAPPINGS: WebcamMapping[] = getDefaultMappingsForLimb('handR');

export function useWebcamTracker() {
  const [state, setState] = useState<WebcamTrackingState>({
    active: false,
    calibrated: false,
    calibratedX: 0,
    calibratedY: 0,
    rawX: 0,
    rawY: 0,
    rawTilt: 0,
    mouthOpen: 0,
    motionEnergy: 0,
    smoothedX: 0,
    smoothedY: 0,
    smoothedTilt: 0,
    mappings: getDefaultMappingsForLimb('handR'),
    sensitivity: 1.2,
    smoothing: 0.65,
    targetLimb: 'handR',
    handDetected: false,
    handType: 'Unknown',
    handAngle: 0,
    pinchDistance: 0,
    mlModelLoaded: false,
  });

  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const isMlLoadingRef = useRef<boolean>(false);

  // Buffer for frame diffing fallback
  const prevFrameData = useRef<Uint8Array | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Initialize ML Hand Landmarker lazily when webcam starts
  const initHandLandmarker = async () => {
    if (handLandmarkerRef.current || isMlLoadingRef.current) return;
    isMlLoadingRef.current = true;
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );
      const landmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 2,
      });
      handLandmarkerRef.current = landmarker;
      setState((s) => ({ ...s, mlModelLoaded: true }));
    } catch (gpuErr) {
      console.warn('GPU Hand Landmarker failed, attempting CPU fallback:', gpuErr);
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          numHands: 2,
        });
        handLandmarkerRef.current = landmarker;
        setState((s) => ({ ...s, mlModelLoaded: true }));
      } catch (cpuErr) {
        console.warn('Hand Landmarker fallback to optical tracker:', cpuErr);
      }
    } finally {
      isMlLoadingRef.current = false;
    }
  };

  const startWebcam = useCallback(async () => {
    try {
      setError(null);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Webcam access is not supported in this browser environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 480 },
          height: { ideal: 360 },
          facingMode: 'user',
        },
        audio: false,
      });

      streamRef.current = stream;

      if (!videoRef.current) {
        const video = document.createElement('video');
        video.playsInline = true;
        video.muted = true;
        videoRef.current = video;
      }

      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      setState((s) => ({ ...s, active: true }));

      // Kick off lightweight hand landmarker download & initialization
      initHandLandmarker();
    } catch (err: any) {
      console.warn('Webcam initialization error:', err);
      setError(err?.message || 'Could not access webcam. Please check permissions.');
      setState((s) => ({ ...s, active: false }));
    }
  }, []);

  const stopWebcam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    if (animFrameId.current) {
      cancelAnimationFrame(animFrameId.current);
      animFrameId.current = null;
    }
    setState((s) => ({
      ...s,
      active: false,
      handDetected: false,
      smoothedX: 0,
      smoothedY: 0,
      smoothedTilt: 0,
      handAngle: 0,
      pinchDistance: 0,
    }));
  }, []);

  const setTargetLimb = useCallback((limbId: LimbId) => {
    setState((s) => ({
      ...s,
      targetLimb: limbId,
      mappings: getDefaultMappingsForLimb(limbId),
    }));
  }, []);

  const calibrate = useCallback(() => {
    setState((s) => ({
      ...s,
      calibrated: true,
      calibratedX: s.rawX,
      calibratedY: s.rawY,
    }));
  }, []);

  const setSensitivity = useCallback((val: number) => {
    setState((s) => ({ ...s, sensitivity: val }));
  }, []);

  const setSmoothing = useCallback((val: number) => {
    setState((s) => ({ ...s, smoothing: val }));
  }, []);

  const updateMapping = useCallback((index: number, partial: Partial<WebcamMapping>) => {
    setState((s) => {
      const next = [...s.mappings];
      next[index] = { ...next[index], ...partial };
      return { ...s, mappings: next };
    });
  }, []);

  const addMapping = useCallback((mapping: WebcamMapping) => {
    setState((s) => ({ ...s, mappings: [...s.mappings, mapping] }));
  }, []);

  const removeMapping = useCallback((index: number) => {
    setState((s) => ({
      ...s,
      mappings: s.mappings.filter((_, i) => i !== index),
    }));
  }, []);

  // Frame processing loop with ML Hand detection & optical fallback
  useEffect(() => {
    if (!state.active) return;

    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
      canvasRef.current.width = 64;
      canvasRef.current.height = 48;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const W = 64;
    const H = 48;

    const processFrame = () => {
      const video = videoRef.current;
      if (video && video.readyState >= 2) {
        let handFound = false;
        let landmarks: { x: number; y: number; z: number }[] | undefined = undefined;
        let handAngle = 0;
        let pinchDist = 0;
        let handType: 'Right' | 'Left' | 'Unknown' = 'Unknown';
        let handNormX = 0;
        let handNormY = 0;

        // Try MediaPipe Hand Landmarker if loaded
        if (handLandmarkerRef.current) {
          try {
            const results = handLandmarkerRef.current.detectForVideo(video, performance.now());
            if (results && results.landmarks && results.landmarks.length > 0) {
              const lms = results.landmarks[0];
              landmarks = lms;
              handFound = true;

              if (results.handednesses && results.handednesses[0]?.[0]) {
                handType = results.handednesses[0][0].categoryName as 'Right' | 'Left';
              }

              // Wrist (0) and Middle Finger MCP (9)
              const wrist = lms[0];
              const middleMcp = lms[9];
              const dx = middleMcp.x - wrist.x;
              const dy = middleMcp.y - wrist.y;
              // Screen angle: up is -90 deg
              const rawAngle = Math.atan2(dy, dx) * (180 / Math.PI);
              handAngle = rawAngle + 90;
              if (handAngle > 180) handAngle -= 360;
              if (handAngle < -180) handAngle += 360;

              // Mirror X for intuitive puppeteer control
              handNormX = (0.5 - middleMcp.x) * 2;
              handNormY = (middleMcp.y - 0.5) * 2;

              // Pinch distance between thumb tip (4) and index tip (8)
              const thumb = lms[4];
              const indexTip = lms[8];
              pinchDist = Math.hypot(thumb.x - indexTip.x, thumb.y - indexTip.y);
            }
          } catch (landmarkerErr) {
            // Ignore frame detection glitch
          }
        }

        // Secondary optical motion & skin tone evaluation
        ctx.drawImage(video, 0, 0, W, H);
        const imgData = ctx.getImageData(0, 0, W, H);
        const data = imgData.data;

        let totalMotion = 0;
        let motionX = 0;
        let motionY = 0;
        let faceWeight = 0;
        let faceX = 0;
        let faceY = 0;
        let leftUpperMass = 0;
        let rightUpperMass = 0;

        const prev = prevFrameData.current;
        const currentGray = new Uint8Array(W * H);

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const gray = (r * 77 + g * 150 + b * 29) >> 8;
          const pixelIndex = i >> 2;
          currentGray[pixelIndex] = gray;

          const px = pixelIndex % W;
          const py = Math.floor(pixelIndex / W);

          const isSkin = r > 90 && g > 40 && b > 20 && r > g && r - b > 15;
          if (isSkin && py < H * 0.85) {
            faceX += px;
            faceY += py;
            faceWeight++;

            if (py < H * 0.5) {
              if (px < W / 2) leftUpperMass++;
              else rightUpperMass++;
            }
          }

          if (prev) {
            const diff = Math.abs(gray - prev[pixelIndex]);
            if (diff > 18) {
              totalMotion += diff;
              motionX += px * diff;
              motionY += py * diff;
            }
          }
        }

        prevFrameData.current = currentGray;

        let rawX = 0;
        let rawY = 0;
        let rawTilt = 0;

        if (handFound) {
          // ML Hand tracking prioritized
          rawX = handNormX;
          rawY = handNormY;
          rawTilt = handAngle;
        } else {
          // Optical fallback
          if (faceWeight > 40) {
            rawX = 1 - (faceX / faceWeight / W) * 2;
            rawY = (faceY / faceWeight / H) * 2 - 1;
            const tiltDiff = rightUpperMass - leftUpperMass;
            rawTilt = Math.min(45, Math.max(-45, tiltDiff * 0.8));
          } else if (totalMotion > 500) {
            rawX = 1 - (motionX / totalMotion / W) * 2;
            rawY = (motionY / totalMotion / H) * 2 - 1;
          }
        }

        const normMotion = Math.min(1, totalMotion / 8000);
        const curState = stateRef.current;

        const calX = curState.calibrated ? curState.calibratedX : 0;
        const calY = curState.calibrated ? curState.calibratedY : 0;

        const effectiveX = (rawX - calX) * curState.sensitivity;
        const effectiveY = (rawY - calY) * curState.sensitivity;
        const effectiveTilt = rawTilt * curState.sensitivity;

        const alpha = Math.max(0.05, 1 - curState.smoothing);

        const smoothedX = curState.smoothedX + (effectiveX - curState.smoothedX) * alpha;
        const smoothedY = curState.smoothedY + (effectiveY - curState.smoothedY) * alpha;
        const smoothedTilt =
          curState.smoothedTilt + (effectiveTilt - curState.smoothedTilt) * alpha;

        setState((s) => ({
          ...s,
          rawX,
          rawY,
          rawTilt,
          motionEnergy: normMotion,
          mouthOpen: normMotion > 0.4 ? normMotion : 0,
          smoothedX,
          smoothedY,
          smoothedTilt,
          handDetected: handFound,
          handType,
          handLandmarks: landmarks,
          handAngle,
          pinchDistance: pinchDist,
        }));
      }

      animFrameId.current = requestAnimationFrame(processFrame);
    };

    animFrameId.current = requestAnimationFrame(processFrame);

    return () => {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [state.active]);

  return {
    state,
    error,
    videoRef,
    startWebcam,
    stopWebcam,
    calibrate,
    setSensitivity,
    setSmoothing,
    setTargetLimb,
    updateMapping,
    addMapping,
    removeMapping,
  };
}
