import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DEFAULT_PIVOTS,
  DEFAULT_REST_POSE,
  LIMB_CONFIGS,
  LIMB_ORDER,
  DEATH_LIMB_CONFIGS,
  DEATH_PIVOTS,
  DEATH_REST_POSE,
  DEATH_PIVOT_PRESETS,
  DEATH_ACTIVE_LIMBS,
  PIGGY_ACTIVE_LIMBS,
  getCharacterConfigs,
  getCharacterPivots,
  getCharacterRestPose,
  getCharacterPivotPresets,
  getCharacterActiveLimbs,
} from './constants/defaultCharacter';
import { PRESET_ANIMATIONS } from './utils/presetAnimations';
import {
  interpolatePoseAtTime,
  smoothKeyframes,
} from './utils/motionSmoothing';
import {
  LayerTrack,
  LimbId,
  LimbPivots,
  LimbPose,
  PuppetPose,
  TimelineState,
} from './types';
import { useWebcamTracker } from './hooks/useWebcamTracker';
import { CharacterSvg } from './components/CharacterSvg';
import { PuppeteerStage } from './components/PuppeteerStage';
import { LayerRack } from './components/LayerRack';
import { PuppeteerController } from './components/PuppeteerController';
import { Timeline } from './components/Timeline';
import { ExportModal } from './components/ExportModal';
import { WalkthroughGuide, WalkthroughStep } from './components/WalkthroughGuide';
import { SvgCodeModal } from './components/SvgCodeModal';
import {
  ParsedCharacterSvg,
  loadSavedCharacterSvg,
  saveCharacterSvg,
  parseCharacterSvg,
  getSavedCharacterType,
  saveCurrentCharacterType,
  loadCharacterSvgByType,
  DEFAULT_CHARACTER_SVG,
  DEATH_CHARACTER_SVG,
} from './utils/customSvgManager';
import {
  CircleDot,
  Code,
  Compass,
  Download,
  HelpCircle,
  Layers,
  Sparkles,
  Volume2,
} from 'lucide-react';

const INITIAL_DURATION = 4.0;
const INITIAL_FPS = 30;

function createInitialTracks(charType: 'piggy' | 'death' = 'piggy'): Record<LimbId, LayerTrack> {
  const result: Partial<Record<LimbId, LayerTrack>> = {};
  const configs = getCharacterConfigs(charType);
  LIMB_ORDER.forEach((limbId) => {
    const config = configs[limbId];
    result[limbId] = {
      id: limbId,
      name: config.name,
      color: config.color,
      isArmed: limbId === 'handR', // Default arm right hand for guided walkthrough
      isMuted: false,
      isSolo: false,
      weight: 1.0,
      timeOffset: 0,
      keyframes: [],
    };
  });
  return result as Record<LimbId, LayerTrack>;
}

export default function App() {
  // Custom SVG State (Loaded from localStorage or defaults)
  const [customSvg, setCustomSvg] = useState<ParsedCharacterSvg>(() => loadSavedCharacterSvg());

  // Character Type State ('piggy' | 'death')
  const [activeCharacter, setActiveCharacter] = useState<'piggy' | 'death'>(() => {
    const initialSvg = loadSavedCharacterSvg();
    if (initialSvg.characterType === 'death') return 'death';
    return getSavedCharacterType();
  });

  const activeConfigs = useMemo(() => getCharacterConfigs(activeCharacter), [activeCharacter]);
  const activePivots = useMemo(() => getCharacterPivots(activeCharacter), [activeCharacter]);
  const activePivotPresets = useMemo(() => getCharacterPivotPresets(activeCharacter), [activeCharacter]);
  const activeLimbs = useMemo(() => getCharacterActiveLimbs(activeCharacter), [activeCharacter]);

  const [tracks, setTracks] = useState<Record<LimbId, LayerTrack>>(() => {
    const initialType = getSavedCharacterType();
    return createInitialTracks(initialType);
  });
  const tracksRef = useRef(tracks);
  tracksRef.current = tracks;

  const [timeline, setTimeline] = useState<TimelineState>({
    currentTime: 0,
    duration: INITIAL_DURATION,
    fps: INITIAL_FPS,
    isPlaying: false, // Automatic playing disabled per user request
    isRecording: false,
    isLooping: true,
    countIn: 0,
  });

  const [selectedLimb, setSelectedLimb] = useState<LimbId | null>('handR');
  const [exportModalOpen, setExportModalOpen] = useState<boolean>(false);
  const [isSvgEditorOpen, setIsSvgEditorOpen] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);

  // Limb center of motion / pivots state
  const [pivots, setPivots] = useState<LimbPivots>(() => ({
    ...getCharacterPivots(getSavedCharacterType()),
  }));
  const [isEditingPivot, setIsEditingPivot] = useState<boolean>(false);

  const handlePivotChange = useCallback((limbId: LimbId, newPivot: { x: number; y: number }) => {
    setPivots((prev) => ({
      ...prev,
      [limbId]: newPivot,
    }));
  }, []);

  const handleResetPivot = useCallback((limbId: LimbId) => {
    const defaultMap = getCharacterPivots(activeCharacter);
    setPivots((prev) => ({
      ...prev,
      [limbId]: { ...(defaultMap[limbId] || { x: 150, y: 150 }) },
    }));
  }, [activeCharacter]);

  // Initial starting poses for each limb
  const [initialPoses, setInitialPoses] = useState<Record<LimbId, LimbPose>>(() => ({
    ...getCharacterRestPose(getSavedCharacterType()),
  }));
  const initialPosesRef = useRef(initialPoses);
  initialPosesRef.current = initialPoses;

  // Manual live overrides (when user is dragging dial or webcam is updating)
  const manualOverrides = useRef<Partial<Record<LimbId, LimbPose>>>({});

  // Character Toggle Switcher Handler (Populates rigging, pivots, rest pose, track metadata)
  const handleToggleCharacter = useCallback((targetChar: 'piggy' | 'death') => {
    setActiveCharacter(targetChar);
    saveCurrentCharacterType(targetChar);

    // 1. Load and parse the new character SVG
    const newSvgParsed = loadCharacterSvgByType(targetChar);
    setCustomSvg(newSvgParsed);
    saveCharacterSvg(newSvgParsed.rawSvg);

    // 2. Populate character rigging (pivots & rest pose)
    const newPivots = getCharacterPivots(targetChar);
    setPivots({ ...newPivots });

    const newRestPose = getCharacterRestPose(targetChar);
    setInitialPoses({ ...newRestPose });
    setCurrentPose({ ...newRestPose });
    manualOverrides.current = {};

    // 3. Update track metadata (names & colors) for the character
    const targetConfigs = getCharacterConfigs(targetChar);
    setTracks((prev) => {
      const next = { ...prev };
      LIMB_ORDER.forEach((limbId) => {
        const conf = targetConfigs[limbId];
        if (next[limbId]) {
          next[limbId] = {
            ...next[limbId],
            name: conf.name,
            color: conf.color,
          };
        }
      });
      tracksRef.current = next;
      return next;
    });

    // 4. Ensure selected limb is valid for the character
    const targetLimbs = getCharacterActiveLimbs(targetChar);
    setSelectedLimb((current) => {
      if (current && !targetLimbs.includes(current)) {
        return 'handR';
      }
      return current;
    });
  }, []);

  const handleApplySvgCode = useCallback((newSvgCode: string) => {
    const res = parseCharacterSvg(newSvgCode);
    if (res.success && res.parsed) {
      setCustomSvg(res.parsed);
      saveCharacterSvg(newSvgCode);
      const isDeath = res.parsed.characterType === 'death';
      const charType: 'piggy' | 'death' = isDeath ? 'death' : 'piggy';
      setActiveCharacter(charType);
      saveCurrentCharacterType(charType);

      // Populate rigging for this character
      const targetPivots = getCharacterPivots(charType);
      setPivots({ ...targetPivots });
      const targetRest = getCharacterRestPose(charType);
      setInitialPoses({ ...targetRest });
      setCurrentPose({ ...targetRest });
      manualOverrides.current = {};

      const targetConfigs = getCharacterConfigs(charType);
      setTracks((prev) => {
        const next = { ...prev };
        LIMB_ORDER.forEach((limbId) => {
          const conf = targetConfigs[limbId];
          if (next[limbId]) {
            next[limbId] = {
              ...next[limbId],
              name: conf.name,
              color: conf.color,
            };
          }
        });
        tracksRef.current = next;
        return next;
      });

      const targetLimbs = getCharacterActiveLimbs(charType);
      setSelectedLimb((current) => {
        if (current && !targetLimbs.includes(current)) {
          return 'handR';
        }
        return current;
      });
    }
  }, []);

  // Guided Walkthrough State (User-selectable duration, primary limb, secondary limb)
  const [walkthroughStep, setWalkthroughStep] = useState<WalkthroughStep>('move_hand');
  const [walkthroughPrimaryLimb, setWalkthroughPrimaryLimb] = useState<LimbId>('handR');
  const [walkthroughSecondaryLimb, setWalkthroughSecondaryLimb] = useState<LimbId>('footR');
  const [handMoved, setHandMoved] = useState<boolean>(false);
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState<boolean>(true);
  const walkthroughStepRef = useRef(walkthroughStep);
  walkthroughStepRef.current = walkthroughStep;
  const walkthroughPrimaryRef = useRef(walkthroughPrimaryLimb);
  walkthroughPrimaryRef.current = walkthroughPrimaryLimb;
  const walkthroughSecondaryRef = useRef(walkthroughSecondaryLimb);
  walkthroughSecondaryRef.current = walkthroughSecondaryLimb;

  // Full 360 degree rotation arc unlock toggle
  const [unlock360Rotation, setUnlock360Rotation] = useState<boolean>(true);

  const [startPosFeedback, setStartPosFeedback] = useState<string | null>(null);

  // Webcam tracking hook
  const {
    state: webcamState,
    error: webcamError,
    startWebcam,
    stopWebcam,
    calibrate: calibrateWebcam,
    setSensitivity: setWebcamSensitivity,
    setSmoothing: setWebcamSmoothing,
    setTargetLimb: setWebcamTargetLimb,
    updateMapping: updateWebcamMapping,
  } = useWebcamTracker();

  // Animation frame references
  const animFrameId = useRef<number | null>(null);
  const lastTimestamp = useRef<number | null>(null);

  // Keep state refs for animation loop
  const timelineRef = useRef(timeline);
  timelineRef.current = timeline;
  const tracksRef = useRef(tracks);
  tracksRef.current = tracks;
  const selectedLimbRef = useRef(selectedLimb);
  selectedLimbRef.current = selectedLimb;
  const webcamStateRef = useRef(webcamState);
  webcamStateRef.current = webcamState;

  // Evaluate current puppet pose at a specific timestamp
  const evaluatePose = useCallback(
    (t: number, useOverrides = true): PuppetPose => {
      const curTracks = tracksRef.current;
      const curTimeline = timelineRef.current;
      const anySolo = (Object.values(curTracks) as LayerTrack[]).some((track) => track.isSolo);

      const pose: Partial<PuppetPose> = {};

      LIMB_ORDER.forEach((limbId) => {
        const track = curTracks[limbId];
        const config = LIMB_CONFIGS[limbId];
        const defaultPose = initialPosesRef.current[limbId] || DEFAULT_REST_POSE[limbId];

        // Solo / Mute handling
        if ((anySolo && !track.isSolo) || track.isMuted) {
          pose[limbId] = { ...defaultPose };
          return;
        }

        // Base interpolated pose from track keyframes
        let limbPose = interpolatePoseAtTime(
          track.keyframes,
          t + track.timeOffset,
          curTimeline.duration,
          defaultPose
        );

        // Apply track weight
        if (track.weight !== 1.0) {
          limbPose = {
            rotation: defaultPose.rotation + (limbPose.rotation - defaultPose.rotation) * track.weight,
            x: limbPose.x * track.weight,
            y: limbPose.y * track.weight,
            scaleX: 1 + ((limbPose.scaleX ?? 1) - 1) * track.weight,
            scaleY: 1 + ((limbPose.scaleY ?? 1) - 1) * track.weight,
          };
        }

        // Apply manual live override if armed or actively selected and playing/recording
        if (useOverrides && manualOverrides.current[limbId]) {
          const isPurePlayback = curTimeline.isPlaying && !curTimeline.isRecording;
          const curWebcam = webcamStateRef.current;
          const isLiveWebcamTarget =
            curWebcam.active && curWebcam.targetLimb === limbId && curWebcam.handDetected;

          // If playback is running and track has recorded keyframes,
          // do NOT lock it to stale manual overrides unless the webcam is actively driving it!
          if (!isPurePlayback || isLiveWebcamTarget || track.keyframes.length === 0) {
            limbPose = { ...limbPose, ...manualOverrides.current[limbId] };
          }
        }

        pose[limbId] = limbPose;
      });

      return pose as PuppetPose;
    },
    []
  );

  // Current evaluated pose state for UI rendering
  const [currentPose, setCurrentPose] = useState<PuppetPose>(() => evaluatePose(0));

  // Ghost pose for onion skinning (-150ms behind)
  const ghostPose = useMemo(() => {
    if (!timeline.isPlaying && !timeline.isRecording) {
      return null;
    }
    const ghostTime =
      (timeline.currentTime - 0.2 + timeline.duration) % timeline.duration;
    return evaluatePose(ghostTime, false);
  }, [timeline.currentTime, timeline.isPlaying, timeline.isRecording, timeline.duration, evaluatePose]);

  // Main playback & recording animation loop
  useEffect(() => {
    const loop = (timestamp: number) => {
      if (lastTimestamp.current === null) {
        lastTimestamp.current = timestamp;
      }
      const dt = (timestamp - lastTimestamp.current) / 1000;
      lastTimestamp.current = timestamp;

      const curTimeline = timelineRef.current;

      // Apply webcam live tracking if active (runs both when paused & playing!)
      const curWebcam = webcamStateRef.current;
      if (curWebcam.active) {
        const targetLimb = curWebcam.targetLimb || 'handR';
        const targetConfig = LIMB_CONFIGS[targetLimb];

        // Ensure non-targeted limbs do NOT retain manual overrides from webcam
        for (const limbKey of LIMB_ORDER) {
          if (limbKey !== targetLimb && manualOverrides.current[limbKey]) {
            delete manualOverrides.current[limbKey];
          }
        }

        // Look up any user-configured inversion or multiplier for the targeted limb
        const rotMap = curWebcam.mappings.find(
          (m) => m.limbId === targetLimb && m.parameter === 'rotation'
        );
        const xMap = curWebcam.mappings.find(
          (m) => m.limbId === targetLimb && m.parameter === 'x'
        );
        const yMap = curWebcam.mappings.find(
          (m) => m.limbId === targetLimb && m.parameter === 'y'
        );
        const scaleMap = curWebcam.mappings.find(
          (m) => m.limbId === targetLimb && m.parameter === 'scaleY'
        );

        const rotInv = rotMap?.invert ? -1 : 1;
        const xInv = xMap?.invert ? -1 : 1;
        const yInv = yMap?.invert ? -1 : 1;
        const rotMultiplier = rotInv * (rotMap?.multiplier ?? 1.0);
        const xMultiplier = xInv * (xMap?.multiplier ?? 35);
        const yMultiplier = yInv * (yMap?.multiplier ?? 30);

        if (curWebcam.handDetected) {
          // ML Hand tracking prioritized for targetLimb
          const existing = manualOverrides.current[targetLimb] || {
            ...DEFAULT_REST_POSE[targetLimb],
          };

          const targetRot =
            DEFAULT_REST_POSE[targetLimb].rotation +
            (curWebcam.handAngle || 0) * curWebcam.sensitivity * rotMultiplier;

          const rot = Math.min(
            targetConfig.rotationRange[1],
            Math.max(targetConfig.rotationRange[0], targetRot)
          );

          const posX = Math.min(
            targetConfig.xRange[1],
            Math.max(targetConfig.xRange[0], curWebcam.smoothedX * xMultiplier)
          );

          const posY = Math.min(
            targetConfig.yRange[1],
            Math.max(targetConfig.yRange[0], curWebcam.smoothedY * yMultiplier)
          );

          let scaleY = 1;
          let scaleX = 1;
          if (['snout', 'head', 'body'].includes(targetLimb) && curWebcam.pinchDistance > 0) {
            const pinchMult = scaleMap?.multiplier ?? 0.6;
            scaleY = Math.min(1.4, Math.max(0.6, 1 + (curWebcam.pinchDistance - 0.2) * pinchMult * 2.5));
            scaleX = 1 / Math.sqrt(scaleY);
          }

          manualOverrides.current[targetLimb] = {
            ...existing,
            rotation: rot,
            x: posX,
            y: posY,
            ...(scaleY !== 1 ? { scaleY, scaleX } : {}),
          };
        } else {
          // Optical fallback (face tilt / motion) driving ONLY the targeted limb
          const existing = manualOverrides.current[targetLimb] || {
            ...DEFAULT_REST_POSE[targetLimb],
          };

          const targetRot =
            DEFAULT_REST_POSE[targetLimb].rotation +
            curWebcam.smoothedTilt * curWebcam.sensitivity * rotMultiplier;

          const rot = Math.min(
            targetConfig.rotationRange[1],
            Math.max(targetConfig.rotationRange[0], targetRot)
          );

          const posX = Math.min(
            targetConfig.xRange[1],
            Math.max(targetConfig.xRange[0], curWebcam.smoothedX * xMultiplier)
          );

          const posY = Math.min(
            targetConfig.yRange[1],
            Math.max(targetConfig.yRange[0], curWebcam.smoothedY * yMultiplier)
          );

          manualOverrides.current[targetLimb] = {
            ...existing,
            rotation: rot,
            x: posX,
            y: posY,
          };
        }
      }

      if (curTimeline.isPlaying || curTimeline.isRecording) {
        let nextTime = curTimeline.currentTime + dt;

        // Loop and Recording Pass Completion handling
        if (nextTime >= curTimeline.duration) {
          if (curTimeline.isRecording) {
            // A recording pass has completed! Clear manual overrides immediately so keyframes play back
            manualOverrides.current = {};
            if (walkthroughStepRef.current === 'record_hand') {
              nextTime = 0;
              setTimeline((s) => ({ ...s, isRecording: false, isPlaying: false, currentTime: 0 }));
              setWalkthroughStep('record_foot');
              setSelectedLimb('footR');
              setTracks((prev) => {
                const next = {
                  ...prev,
                  handR: { ...prev.handR, isArmed: false },
                  footR: { ...prev.footR, isArmed: true },
                };
                tracksRef.current = next;
                return next;
              });
            } else if (walkthroughStepRef.current === 'record_foot') {
              nextTime = 0;
              setWalkthroughStep('completed');
              // Play both stacked layers in loop so user watches the combined performance!
              setTimeline((s) => ({
                ...s,
                isRecording: false,
                isPlaying: true,
                isLooping: true,
                currentTime: 0,
              }));
              setTracks((prev) => {
                const next = {
                  ...prev,
                  footR: { ...prev.footR, isArmed: false },
                };
                tracksRef.current = next;
                return next;
              });
            } else {
              nextTime = 0;
              setTimeline((s) => ({ ...s, isRecording: false, isPlaying: true, currentTime: 0 }));
            }
          } else {
            if (curTimeline.isLooping) {
              nextTime = nextTime % curTimeline.duration;
            } else {
              nextTime = curTimeline.duration;
              setTimeline((s) => ({ ...s, isPlaying: false, isRecording: false }));
            }
          }
        }

        // Recording Keyframe Capture
        if (curTimeline.isRecording) {
          const armedLimbIds = LIMB_ORDER.filter((id) => tracksRef.current[id].isArmed);

          if (armedLimbIds.length > 0) {
            setTracks((prev) => {
              const next = { ...prev };
              armedLimbIds.forEach((limbId) => {
                const limbTrack = next[limbId];
                const activeLimbPose =
                  manualOverrides.current[limbId] ||
                  prev[limbId].keyframes.find((k) => Math.abs(k.time - nextTime) < 0.05)?.pose ||
                  DEFAULT_REST_POSE[limbId];

                // Append keyframe
                const newKf = {
                  time: parseFloat(nextTime.toFixed(3)),
                  pose: { ...activeLimbPose },
                };

                // Replace or append
                const existingIdx = limbTrack.keyframes.findIndex(
                  (k) => Math.abs(k.time - nextTime) < 0.03
                );
                let updatedKf = [...limbTrack.keyframes];
                if (existingIdx >= 0) {
                  updatedKf[existingIdx] = newKf;
                } else {
                  updatedKf.push(newKf);
                  updatedKf.sort((a, b) => a.time - b.time);
                }

                next[limbId] = {
                  ...limbTrack,
                  keyframes: updatedKf,
                };
              });
              tracksRef.current = next;
              return next;
            });
          }
        }

        setTimeline((s) => ({ ...s, currentTime: nextTime }));
        setCurrentPose(evaluatePose(nextTime));
      } else {
        // Paused: evaluate at static currentTime
        setCurrentPose(evaluatePose(curTimeline.currentTime));
      }

      animFrameId.current = requestAnimationFrame(loop);
    };

    animFrameId.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [evaluatePose]);

  // Puppeteering manual input handler
  const handlePoseChange = useCallback(
    (limbId: LimbId, partialPose: Partial<LimbPose>) => {
      // Detect interaction on chosen primary limb for guided walkthrough
      if (limbId === walkthroughPrimaryRef.current) {
        setHandMoved(true);
      }

      const currentLimbPose =
        manualOverrides.current[limbId] || currentPose[limbId] || initialPosesRef.current[limbId] || DEFAULT_REST_POSE[limbId];
      const updated: LimbPose = {
        ...currentLimbPose,
        ...partialPose,
      };
      manualOverrides.current[limbId] = updated;

      setCurrentPose((prev) => ({
        ...prev,
        [limbId]: updated,
      }));

      // When paused at currentTime === 0 (or before recording starts),
      // update initialPoses so this is explicitly remembered as the start position!
      if (!timeline.isRecording && !timeline.isPlaying && timeline.currentTime === 0) {
        setInitialPoses((prev) => ({
          ...prev,
          [limbId]: updated,
        }));
      }

      // If recording, capture immediately
      if (timeline.isRecording && tracks[limbId]?.isArmed) {
        const t = parseFloat(timeline.currentTime.toFixed(3));
        setTracks((prev) => {
          const track = prev[limbId];
          const nextKf = [...track.keyframes, { time: t, pose: updated }].sort(
            (a, b) => a.time - b.time
          );
          return {
            ...prev,
            [limbId]: { ...track, keyframes: nextKf },
          };
        });
      }
    },
    [currentPose, timeline.isRecording, timeline.isPlaying, timeline.currentTime, tracks]
  );

  // Set explicit initial start position for a body part
  const handleSetStartPosition = useCallback((targetLimb?: LimbId) => {
    const limb = targetLimb || selectedLimb;
    if (limb && currentPose[limb]) {
      const poseToSave = { ...currentPose[limb] };
      setInitialPoses((prev) => ({
        ...prev,
        [limb]: poseToSave,
      }));
      manualOverrides.current[limb] = poseToSave;
      // Prepend or update keyframe at t=0 for this track
      setTracks((prev) => {
        const tr = prev[limb];
        if (!tr) return prev;
        const otherKf = tr.keyframes.filter((k) => k.time > 0.03);
        const updatedKf = [{ time: 0, pose: poseToSave }, ...otherKf].sort((a, b) => a.time - b.time);
        return {
          ...prev,
          [limb]: {
            ...tr,
            keyframes: updatedKf,
          },
        };
      });
      setStartPosFeedback(`Start position set for ${LIMB_CONFIGS[limb].name}!`);
      setTimeout(() => setStartPosFeedback(null), 2500);
    }
  }, [selectedLimb, currentPose]);

  const handleResetToStartPosition = useCallback((targetLimb?: LimbId) => {
    const limb = targetLimb || selectedLimb;
    if (limb) {
      const startP = { ...(initialPosesRef.current[limb] || DEFAULT_REST_POSE[limb]) };
      manualOverrides.current[limb] = startP;
      setCurrentPose((prev) => ({
        ...prev,
        [limb]: startP,
      }));
    }
  }, [selectedLimb]);

  // Walkthrough navigation controls
  const handleWalkthroughNext = useCallback(() => {
    manualOverrides.current = {};
    const pLimb = walkthroughPrimaryRef.current;
    const sLimb = walkthroughSecondaryRef.current;

    if (walkthroughStep === 'move_hand') {
      setWalkthroughStep('record_hand');
      setSelectedLimb(pLimb);
      setTracks((prev) => {
        const next = { ...prev };
        LIMB_ORDER.forEach((id) => {
          if (next[id]) {
            next[id] = { ...next[id], isArmed: id === pLimb };
          }
        });
        tracksRef.current = next;
        return next;
      });
    } else if (walkthroughStep === 'record_hand') {
      setWalkthroughStep('record_foot');
      setSelectedLimb(sLimb);
      setTracks((prev) => {
        const next = { ...prev };
        LIMB_ORDER.forEach((id) => {
          if (next[id]) {
            next[id] = { ...next[id], isArmed: id === sLimb };
          }
        });
        tracksRef.current = next;
        return next;
      });
      setTimeline((s) => ({ ...s, currentTime: 0, isPlaying: false, isRecording: false }));
    } else if (walkthroughStep === 'record_foot') {
      setWalkthroughStep('completed');
      setTimeline((s) => ({ ...s, isPlaying: true, isLooping: true, currentTime: 0, isRecording: false }));
      setTracks((prev) => {
        const next = { ...prev };
        LIMB_ORDER.forEach((id) => {
          if (next[id]) {
            next[id] = { ...next[id], isArmed: false };
          }
        });
        tracksRef.current = next;
        return next;
      });
    }
  }, [walkthroughStep]);

  const handleWalkthroughRestart = useCallback(() => {
    const pLimb = walkthroughPrimaryRef.current;
    const sLimb = walkthroughSecondaryRef.current;
    setWalkthroughStep('move_hand');
    setHandMoved(false);
    setSelectedLimb(pLimb);
    setTracks((prev) => {
      const next = { ...prev };
      if (next[pLimb]) next[pLimb] = { ...next[pLimb], keyframes: [], isArmed: true };
      if (next[sLimb]) next[sLimb] = { ...next[sLimb], keyframes: [], isArmed: false };
      tracksRef.current = next;
      return next;
    });
    setTimeline((s) => ({ ...s, currentTime: 0, isPlaying: false, isRecording: false, countIn: 0 }));
    manualOverrides.current = {};
    setCurrentPose(evaluatePose(0, false));
  }, [evaluatePose]);

  // Play / Pause toggle
  const handleTogglePlay = useCallback(() => {
    setTimeline((s) => ({
      ...s,
      isPlaying: !s.isPlaying,
      isRecording: false,
    }));
    manualOverrides.current = {};
  }, []);

  // Record Layer toggle (Stacking workflow!)
  const handleToggleRecord = useCallback(() => {
    if (timeline.isRecording) {
      // Stop recording pass
      manualOverrides.current = {};
      setTimeline((s) => ({ ...s, isRecording: false, isPlaying: true }));
    } else {
      // Preserve current start positions of all limbs (especially armed limbs)
      const currentStartPoses = { ...currentPose };
      const armedLimbIds = LIMB_ORDER.filter((id) => tracksRef.current[id]?.isArmed);

      // Keep armed limbs in manualOverrides so they don't snap back to 0,0!
      armedLimbIds.forEach((limbId) => {
        if (currentStartPoses[limbId]) {
          manualOverrides.current[limbId] = { ...currentStartPoses[limbId] };
        }
      });

      // Commit the initial starting pose at t=0 for the armed tracks
      setTracks((prev) => {
        const next = { ...prev };
        armedLimbIds.forEach((limbId) => {
          const limbTrack = next[limbId];
          const limbStartPose = currentStartPoses[limbId] || initialPosesRef.current[limbId] || DEFAULT_REST_POSE[limbId];
          const filtered = limbTrack.keyframes.filter((k) => k.time > 0.04);
          next[limbId] = {
            ...limbTrack,
            keyframes: [{ time: 0, pose: { ...limbStartPose } }, ...filtered],
          };
        });
        tracksRef.current = next;
        return next;
      });

      // Start 3-2-1 count-in before recording pass without wiping out user's starting positions
      setTimeline((s) => ({ ...s, countIn: 3, isPlaying: false, currentTime: 0 }));
      let count = 3;
      const timer = setInterval(() => {
        count--;
        if (count > 0) {
          setTimeline((s) => ({ ...s, countIn: count }));
        } else {
          clearInterval(timer);
          // Re-ensure armed limbs start directly from their initial start position!
          armedLimbIds.forEach((limbId) => {
            if (currentStartPoses[limbId]) {
              manualOverrides.current[limbId] = { ...currentStartPoses[limbId] };
            }
          });
          setTimeline((s) => ({
            ...s,
            countIn: 0,
            isRecording: true,
            isPlaying: true,
            currentTime: 0, // start at beginning of sequence
          }));
        }
      }, 700);
    }
  }, [timeline.isRecording, currentPose]);

  const handleStop = useCallback(() => {
    setTimeline((s) => ({
      ...s,
      isPlaying: false,
      isRecording: false,
      currentTime: 0,
      countIn: 0,
    }));
    manualOverrides.current = {};
    setCurrentPose(evaluatePose(0, false));
  }, [evaluatePose]);

  const handleStopWebcam = useCallback(() => {
    manualOverrides.current = {};
    stopWebcam();
  }, [stopWebcam]);

  const handleSetWebcamTargetLimb = useCallback(
    (limbId: LimbId) => {
      manualOverrides.current = {};
      setWebcamTargetLimb(limbId);
      setSelectedLimb(limbId);
    },
    [setWebcamTargetLimb]
  );

  const handleSeek = useCallback(
    (time: number) => {
      const clamped = Math.min(timeline.duration, Math.max(0, time));
      setTimeline((s) => ({ ...s, currentTime: clamped }));
      manualOverrides.current = {};
      setCurrentPose(evaluatePose(clamped, false));
    },
    [timeline.duration, evaluatePose]
  );

  const handleToggleArm = useCallback((limbId: LimbId) => {
    setTracks((prev) => ({
      ...prev,
      [limbId]: { ...prev[limbId], isArmed: !prev[limbId].isArmed },
    }));
  }, []);

  const handleToggleMute = useCallback((limbId: LimbId) => {
    setTracks((prev) => ({
      ...prev,
      [limbId]: { ...prev[limbId], isMuted: !prev[limbId].isMuted },
    }));
  }, []);

  const handleToggleSolo = useCallback((limbId: LimbId) => {
    setTracks((prev) => ({
      ...prev,
      [limbId]: { ...prev[limbId], isSolo: !prev[limbId].isSolo },
    }));
  }, []);

  const handleClearTrack = useCallback((limbId: LimbId) => {
    if (confirm(`Clear all recorded motion for ${LIMB_CONFIGS[limbId].name}?`)) {
      setTracks((prev) => ({
        ...prev,
        [limbId]: { ...prev[limbId], keyframes: [] },
      }));
      delete manualOverrides.current[limbId];
    }
  }, []);

  const handleSmoothTrack = useCallback((limbId: LimbId) => {
    setTracks((prev) => {
      const kfs = prev[limbId].keyframes;
      if (kfs.length < 3) return prev;
      return {
        ...prev,
        [limbId]: {
          ...prev[limbId],
          keyframes: smoothKeyframes(kfs, 4),
        },
      };
    });
  }, []);

  const handleUpdateTrackWeight = useCallback((limbId: LimbId, weight: number) => {
    setTracks((prev) => ({
      ...prev,
      [limbId]: { ...prev[limbId], weight },
    }));
  }, []);

  // Load Preset Animations (Entire puppet or target limb only)
  const handleLoadPreset = useCallback(
    (presetId: string, targetLimbOnly?: LimbId) => {
      const preset = PRESET_ANIMATIONS.find((p) => p.id === presetId);
      if (!preset) return;

      if (targetLimbOnly) {
        // Load only for selected limb
        const limbKfs = preset.tracks[targetLimbOnly];
        if (limbKfs) {
          setTracks((prev) => ({
            ...prev,
            [targetLimbOnly]: {
              ...prev[targetLimbOnly],
              keyframes: [...limbKfs],
            },
          }));
        }
      } else {
        // Load full puppet performance
        setTimeline((s) => ({
          ...s,
          duration: preset.duration,
          currentTime: 0,
          isPlaying: true,
        }));
        setTracks((prev) => {
          const next = { ...prev };
          LIMB_ORDER.forEach((limbId) => {
            const kfs = preset.tracks[limbId];
            next[limbId] = {
              ...next[limbId],
              keyframes: kfs ? [...kfs] : [],
            };
          });
          return next;
        });
      }
      manualOverrides.current = {};
    },
    []
  );

  // Global Pose Resets
  const handleResetPose = useCallback(() => {
    const rest = getCharacterRestPose(activeCharacter);
    if (selectedLimb) {
      const def = { ...rest[selectedLimb] };
      delete manualOverrides.current[selectedLimb];
      setInitialPoses((prev) => ({
        ...prev,
        [selectedLimb]: def,
      }));
      setCurrentPose((prev) => ({
        ...prev,
        [selectedLimb]: def,
      }));
    } else {
      manualOverrides.current = {};
      setInitialPoses({ ...rest });
      setCurrentPose({ ...rest });
    }
  }, [selectedLimb, activeCharacter]);

  const handleMirrorPose = useCallback(() => {
    // Swap left and right limbs
    setCurrentPose((prev) => ({
      ...prev,
      handL: { ...prev.handR, rotation: -prev.handR.rotation - 90 },
      handR: { ...prev.handL, rotation: -prev.handL.rotation - 90 },
      footL: { ...prev.footR, rotation: -prev.footR.rotation },
      footR: { ...prev.footL, rotation: -prev.footL.rotation },
      earL: { ...prev.earR, rotation: -prev.earR.rotation },
      earR: { ...prev.earL, rotation: -prev.earL.rotation },
    }));
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea', 'select'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleToggleRecord();
      } else if (e.key === '0') {
        e.preventDefault();
        handleSeek(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTogglePlay, handleToggleRecord, handleSeek]);

  const armedLimbName = selectedLimb ? LIMB_CONFIGS[selectedLimb].name : undefined;

  return (
    <div className="flex flex-col h-screen w-screen bg-neutral-950 text-neutral-100 font-sans overflow-hidden">
      {/* Top Application Header */}
      <header className="h-14 border-b border-neutral-800 bg-neutral-900/90 backdrop-blur-md px-4 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          {/* App Logo & Character Tag */}
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-md transition-all ${
              activeCharacter === 'death'
                ? 'bg-gradient-to-tr from-indigo-700 to-sky-600 shadow-indigo-950'
                : 'bg-gradient-to-tr from-rose-500 to-pink-400 shadow-rose-950'
            }`}>
              <span className="text-lg">{activeCharacter === 'death' ? '💀' : '🐷'}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black tracking-tight text-white">
                  PiggyMotion
                </h1>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Puppeteer Studio
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                {activeCharacter === 'death'
                  ? 'Multi-layer puppet animation for Grim Reaper Skeleton'
                  : 'Multi-layer performance recording for SVG character'}
              </p>
            </div>
          </div>

          {/* Prominent Character Switcher Toggle */}
          <div className="flex items-center p-0.5 bg-neutral-900 border border-neutral-700/80 rounded-xl shadow-inner gap-0.5 ml-1">
            <button
              id="header-btn-toggle-piggy"
              onClick={() => handleToggleCharacter('piggy')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                activeCharacter === 'piggy'
                  ? 'bg-rose-600 text-white shadow-sm ring-1 ring-rose-400/50'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
              }`}
              title="Switch to Piggy Character (Classic rigged puppet)"
            >
              <span>🐷</span>
              <span>Piggy</span>
              {activeCharacter === 'piggy' && (
                <span className="w-1.5 h-1.5 rounded-full bg-white ml-0.5" />
              )}
            </button>
            <button
              id="header-btn-toggle-death"
              onClick={() => handleToggleCharacter('death')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                activeCharacter === 'death'
                  ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400/50'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
              }`}
              title="Switch to Death (Grim Reaper skeleton with rigged limbs)"
            >
              <span>💀</span>
              <span>Death</span>
              <span className="text-[9px] uppercase font-mono px-1 py-0.2 rounded bg-indigo-900/60 text-indigo-200 border border-indigo-500/40">
                Rigged
              </span>
              {activeCharacter === 'death' && (
                <span className="w-1.5 h-1.5 rounded-full bg-sky-300 ml-0.5 animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {/* Center Quick Actions */}
        <div className="hidden md:flex items-center gap-2">
          {/* Quick Preset Performance Dropdown */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neutral-800/80 border border-neutral-700/80 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-neutral-400">Routine:</span>
            <select
              id="top-quick-preset-select"
              onChange={(e) => {
                if (e.target.value) handleLoadPreset(e.target.value);
              }}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
              defaultValue=""
            >
              <option value="" disabled>
                Load Performance Routine...
              </option>
              {PRESET_ANIMATIONS.map((p) => (
                <option key={p.id} value={p.id} className="bg-neutral-900 text-white">
                  {p.name} ({p.duration}s)
                </option>
              ))}
            </select>
          </div>

          {/* Stacking Guide Tip */}
          <button
            id="btn-help-guide"
            onClick={() => setShowHelp((h) => !h)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition-colors"
            title="How to Stack Movement Layers"
          >
            <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
            <span>Stacking Guide</span>
          </button>

          {/* Guided Walkthrough toggle button */}
          {!isWalkthroughOpen && (
            <button
              id="btn-header-open-walkthrough"
              onClick={() => setIsWalkthroughOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Interactive Tutorial</span>
            </button>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Edit SVG Code Button */}
          <button
            id="btn-open-svg-code"
            onClick={() => setIsSvgEditorOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white border border-neutral-700 text-xs font-semibold transition-all shadow-sm"
            title="Edit character SVG markup, vector paths, defs, and inset shadow"
          >
            <Code className="w-3.5 h-3.5 text-sky-400" />
            <span>Edit SVG Code</span>
          </button>

          {/* Export Button */}
          <button
            id="btn-open-export-modal"
            onClick={() => setExportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Export Animation
          </button>
        </div>
      </header>

      {/* Main Studio Workspace Grid */}
      <main className="flex-1 flex overflow-hidden p-3 gap-3">
        {/* Left Column: Layer Stacking Rack (Multi-track limbs) */}
        <div className="w-72 shrink-0 flex flex-col h-full">
          <LayerRack
            tracks={tracks}
            currentPose={currentPose}
            selectedLimb={selectedLimb}
            onSelectLimb={setSelectedLimb}
            onToggleArm={handleToggleArm}
            onToggleMute={handleToggleMute}
            onToggleSolo={handleToggleSolo}
            onClearTrack={handleClearTrack}
            onSmoothTrack={handleSmoothTrack}
            onUpdateTrackWeight={handleUpdateTrackWeight}
            isRecording={timeline.isRecording}
          />
        </div>

        {/* Center Column: Puppeteer Stage & Bottom Timeline */}
        <div className="flex-1 flex flex-col h-full min-w-0 gap-3">
          {/* Interactive Guided Walkthrough Banner */}
          <WalkthroughGuide
            currentStep={walkthroughStep}
            primaryLimb={walkthroughPrimaryLimb}
            onSelectPrimaryLimb={(limbId) => {
              setWalkthroughPrimaryLimb(limbId);
              setSelectedLimb(limbId);
              setHandMoved(false);
              setTracks((prev) => {
                const next = { ...prev };
                LIMB_ORDER.forEach((id) => {
                  if (next[id]) next[id] = { ...next[id], isArmed: id === limbId };
                });
                tracksRef.current = next;
                return next;
              });
            }}
            secondaryLimb={walkthroughSecondaryLimb}
            onSelectSecondaryLimb={(limbId) => {
              setWalkthroughSecondaryLimb(limbId);
            }}
            duration={timeline.duration}
            onChangeDuration={(newDur) => {
              setTimeline((s) => ({
                ...s,
                duration: newDur,
                currentTime: Math.min(s.currentTime, newDur),
              }));
            }}
            handMoved={handMoved}
            handKeyframeCount={tracks[walkthroughPrimaryLimb]?.keyframes.length || 0}
            footKeyframeCount={tracks[walkthroughSecondaryLimb]?.keyframes.length || 0}
            isRecording={timeline.isRecording}
            isPlaying={timeline.isPlaying}
            countIn={timeline.countIn}
            selectedLimb={selectedLimb}
            onSelectLimb={setSelectedLimb}
            onStartRecord={handleToggleRecord}
            onTogglePlay={handleTogglePlay}
            onNextStep={handleWalkthroughNext}
            onPrevStep={() => {}}
            onRestart={handleWalkthroughRestart}
            onDismiss={() => setIsWalkthroughOpen(false)}
            isOpen={isWalkthroughOpen}
            onToggleOpen={() => setIsWalkthroughOpen((o) => !o)}
          />

          {/* Stage Area */}
          <div className="flex-1 min-h-0 relative">
            <PuppeteerStage
              pose={currentPose}
              pivots={pivots}
              onPivotChange={handlePivotChange}
              onResetPivot={handleResetPivot}
              isEditingPivot={isEditingPivot}
              onToggleEditPivot={setIsEditingPivot}
              ghostPose={ghostPose}
              selectedLimb={selectedLimb}
              onSelectLimb={setSelectedLimb}
              onPoseChange={handlePoseChange}
              isRecording={timeline.isRecording}
              armedLimbName={armedLimbName}
              countIn={timeline.countIn}
              onResetPose={handleResetPose}
              customSvg={customSvg}
              unlock360Rotation={unlock360Rotation}
              onToggle360Rotation={setUnlock360Rotation}
              onSetStartPosition={handleSetStartPosition}
              onResetToStartPosition={handleResetToStartPosition}
              startPositionFeedback={startPosFeedback}
            />

            {/* Stacking Guide Modal Overlay if open */}
            {showHelp && (
              <div className="absolute inset-4 z-40 bg-neutral-900/95 border border-neutral-700 rounded-2xl p-6 backdrop-blur-md overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <h3 className="text-base font-bold text-white">
                      Puppeteering & Layer Stacking Workflow
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowHelp(false)}
                    className="text-xs px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200"
                  >
                    Close
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-xs text-neutral-300">
                  <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-1.5">
                    <span className="font-bold text-sky-400 text-sm">1. Arm & Record Pass</span>
                    <p>
                      Click the <strong>REC</strong> icon on a limb in the left rack (e.g. <em>Body & Torso</em>). Hit <strong>Record Layer</strong>. Perform the body bounce using mouse drag or webcam tilt!
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-1.5">
                    <span className="font-bold text-emerald-400 text-sm">2. Stack Next Limb</span>
                    <p>
                      Now arm <em>Left Hand</em> or <em>Right Hand</em>. As you record pass 2, the pig will <strong>play back your body groove in real-time</strong> while you wave the hand in sync!
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-1.5">
                    <span className="font-bold text-amber-400 text-sm">3. Polish & Export</span>
                    <p>
                      Layer head nods, ear wiggles, and snout snorts. Use <strong>Smooth</strong> to eliminate jitter, tweak <strong>Layer Strength</strong>, and click <strong>Export</strong> for animated SVG or WebM!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Animation Timeline */}
          <div className="h-44 shrink-0">
            <Timeline
              timeline={timeline}
              tracks={tracks}
              selectedLimb={selectedLimb}
              onSelectLimb={setSelectedLimb}
              onTogglePlay={handleTogglePlay}
              onToggleRecord={handleToggleRecord}
              onStop={handleStop}
              onSeek={handleSeek}
              onToggleLoop={() =>
                setTimeline((s) => ({ ...s, isLooping: !s.isLooping }))
              }
              onSetDuration={(d) =>
                setTimeline((s) => ({ ...s, duration: d, currentTime: Math.min(s.currentTime, d) }))
              }
              onSetFps={(f) => setTimeline((s) => ({ ...s, fps: f }))}
            />
          </div>
        </div>

        {/* Right Column: Puppeteer Input Controller (Manual, Webcam, Presets) */}
        <div className="w-80 shrink-0 flex flex-col h-full">
          <PuppeteerController
            selectedLimb={selectedLimb}
            currentPose={currentPose}
            pivots={pivots}
            onPivotChange={handlePivotChange}
            onResetPivot={handleResetPivot}
            isEditingPivot={isEditingPivot}
            onToggleEditPivot={setIsEditingPivot}
            onPoseChange={handlePoseChange}
            webcamState={webcamState}
            webcamError={webcamError}
            onStartWebcam={startWebcam}
            onStopWebcam={handleStopWebcam}
            onCalibrateWebcam={calibrateWebcam}
            onSetWebcamSensitivity={setWebcamSensitivity}
            onSetWebcamSmoothing={setWebcamSmoothing}
            onSetTargetLimb={handleSetWebcamTargetLimb}
            onUpdateWebcamMapping={updateWebcamMapping}
            onLoadPreset={handleLoadPreset}
            onResetPose={handleResetPose}
            onMirrorPose={handleMirrorPose}
            unlock360Rotation={unlock360Rotation}
            onToggle360Rotation={setUnlock360Rotation}
            onSetStartPosition={handleSetStartPosition}
            onResetToStartPosition={handleResetToStartPosition}
            startPositionFeedback={startPosFeedback}
          />
        </div>
      </main>

      {/* Export Modal */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        tracks={tracks}
        timeline={timeline}
        currentPose={currentPose}
        pivots={pivots}
        onImportTracks={({ duration, tracks: importedTracks, pivots: importedPivots }) => {
          setTimeline((s) => ({ ...s, duration, currentTime: 0 }));
          setTracks(importedTracks);
          if (importedPivots) {
            setPivots(importedPivots);
          }
        }}
        customSvg={customSvg}
      />

      {/* SVG Code Editor Modal */}
      <SvgCodeModal
        isOpen={isSvgEditorOpen}
        onClose={() => setIsSvgEditorOpen(false)}
        currentSvgCode={customSvg.rawSvg}
        onApplySvgCode={handleApplySvgCode}
        pose={currentPose}
        pivots={pivots}
      />
    </div>
  );
}
