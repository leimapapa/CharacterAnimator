import React, { useMemo, useState } from 'react';
import JSZip from 'jszip';
import fixWebmDuration from 'fix-webm-duration';
import { LayerTrack, LimbId, LimbPivots, PuppetPose, TimelineState } from '../types';
import { generateAnimatedSvg, generateStaticPoseSvg, triggerFileDownload } from '../utils/svgExporter';
import { interpolatePoseAtTime } from '../utils/motionSmoothing';
import { PRESET_ANIMATIONS } from '../utils/presetAnimations';
import { DEFAULT_REST_POSE, LIMB_ORDER } from '../constants/defaultCharacter';
import { ParsedCharacterSvg } from '../utils/customSvgManager';
import {
  Archive,
  Camera,
  Check,
  Clock,
  Code,
  Copy,
  Download,
  Eye,
  FileCode,
  Film,
  Images,
  Link,
  Loader2,
  Maximize2,
  Play,
  RotateCcw,
  Sparkles,
  Unlink,
  Upload,
  Video,
  X,
} from 'lucide-react';

export type ExportBackgroundMode = 'transparent' | 'dark' | 'white' | 'green';

export interface ResolutionPreset {
  id: string;
  label: string;
  width: number;
  height: number;
  aspect: string;
  description: string;
}

export const RESOLUTION_PRESETS: ResolutionPreset[] = [
  { id: '300', label: '300 × 300', width: 300, height: 300, aspect: '1:1', description: '1x Compact' },
  { id: '480', label: '480 × 480', width: 480, height: 480, aspect: '1:1', description: 'Standard SD' },
  { id: '600', label: '600 × 600', width: 600, height: 600, aspect: '1:1', description: 'Medium (Default)' },
  { id: '720', label: '720 × 720', width: 720, height: 720, aspect: '1:1', description: 'HD Square' },
  { id: '1080', label: '1080 × 1080', width: 1080, height: 1080, aspect: '1:1', description: 'Full HD Social' },
  { id: '1440', label: '1440 × 1440', width: 1440, height: 1440, aspect: '1:1', description: '2K High-Res' },
  { id: '1920x1080', label: '1920 × 1080', width: 1920, height: 1080, aspect: '16:9', description: '16:9 Widescreen' },
  { id: '1080x1920', label: '1080 × 1920', width: 1080, height: 1920, aspect: '9:16', description: '9:16 Shorts/Reels' },
  { id: 'custom', label: 'Custom', width: 600, height: 600, aspect: 'Custom', description: 'User-specified dimensions' },
];

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tracks: Record<LimbId, LayerTrack>;
  timeline: TimelineState;
  currentPose: PuppetPose;
  pivots?: LimbPivots;
  onImportTracks: (imported: {
    duration: number;
    tracks: Record<LimbId, LayerTrack>;
    pivots?: LimbPivots;
  }) => void;
  customSvg?: ParsedCharacterSvg;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  tracks,
  timeline,
  currentPose,
  pivots,
  onImportTracks,
  customSvg,
}) => {
  const [selectedSource, setSelectedSource] = useState<string>('current');
  const [customDuration, setCustomDuration] = useState<number | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isRenderingVideo, setIsRenderingVideo] = useState<boolean>(false);
  const [isRenderingZip, setIsRenderingZip] = useState<boolean>(false);
  const [isRenderingSinglePng, setIsRenderingSinglePng] = useState<boolean>(false);
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [bgMode, setBgMode] = useState<ExportBackgroundMode>('transparent');
  const [lastExportedVideoUrl, setLastExportedVideoUrl] = useState<string | null>(null);
  const [previewBg, setPreviewBg] = useState<'checkerboard' | 'dark' | 'white'>('checkerboard');

  const transparentBg = bgMode === 'transparent';

  // Resolution controls state
  const [selectedResolutionId, setSelectedResolutionId] = useState<string>('600');
  const [customWidth, setCustomWidth] = useState<number>(600);
  const [customHeight, setCustomHeight] = useState<number>(600);
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);

  // Compute active export width and height
  const { exportWidth, exportHeight } = useMemo(() => {
    if (selectedResolutionId === 'custom') {
      return {
        exportWidth: Math.max(100, Math.min(3840, customWidth)),
        exportHeight: Math.max(100, Math.min(3840, customHeight)),
      };
    }
    const preset = RESOLUTION_PRESETS.find((p) => p.id === selectedResolutionId) || RESOLUTION_PRESETS[2];
    return {
      exportWidth: preset.width,
      exportHeight: preset.height,
    };
  }, [selectedResolutionId, customWidth, customHeight]);

  // Compute the latest recorded keyframe across all tracks
  const recordedKeyframeDuration = useMemo(() => {
    let maxTime = 0;
    (Object.values(tracks) as LayerTrack[]).forEach((tr) => {
      if (tr.keyframes && tr.keyframes.length > 0) {
        tr.keyframes.forEach((kf) => {
          if (kf.time > maxTime) maxTime = kf.time;
        });
      }
    });
    return maxTime > 0 ? parseFloat(maxTime.toFixed(2)) : null;
  }, [tracks]);

  if (!isOpen) return null;

  // Resolve active tracks and duration depending on selected source
  const getActiveExportData = (): {
    exportTracks: Record<LimbId, LayerTrack>;
    exportDuration: number;
    title: string;
  } => {
    if (selectedSource === 'current') {
      const baseDuration = customDuration !== null ? customDuration : timeline.duration;
      return {
        exportTracks: tracks,
        exportDuration: Math.max(0.5, baseDuration),
        title: 'piggy_custom_performance',
      };
    }

    const preset = PRESET_ANIMATIONS.find((p) => p.id === selectedSource);
    if (preset) {
      const generatedTracks: Record<LimbId, LayerTrack> = {} as any;
      LIMB_ORDER.forEach((limbId) => {
        generatedTracks[limbId] = {
          id: limbId,
          name: limbId,
          color: '#38bdf8',
          keyframes: preset.tracks[limbId] || [],
          isArmed: false,
          isMuted: false,
          isSolo: false,
          weight: 1.0,
          timeOffset: 0,
        };
      });
      const baseDuration = customDuration !== null ? customDuration : preset.duration;
      return {
        exportTracks: generatedTracks,
        exportDuration: Math.max(0.5, baseDuration),
        title: `piggy_${preset.id}`,
      };
    }

    const baseDuration = customDuration !== null ? customDuration : timeline.duration;
    return {
      exportTracks: tracks,
      exportDuration: Math.max(0.5, baseDuration),
      title: 'piggy_performance',
    };
  };

  const { exportTracks, exportDuration, title } = getActiveExportData();

  const handleSourceChange = (newSource: string) => {
    setSelectedSource(newSource);
    setCustomDuration(null);
  };

  // Helper to compute character pose at time t for the active tracks
  const evaluatePoseAtTime = (t: number): PuppetPose => {
    const pose: Partial<PuppetPose> = {};
    LIMB_ORDER.forEach((limbId) => {
      const tr = exportTracks[limbId];
      const defaultPose = DEFAULT_REST_POSE[limbId];
      if (!tr || tr.isMuted) {
        pose[limbId] = { ...defaultPose };
        return;
      }
      const p = interpolatePoseAtTime(
        tr.keyframes || [],
        t + (tr.timeOffset || 0),
        exportDuration,
        defaultPose
      );
      const w = tr.weight ?? 1.0;
      pose[limbId] = {
        rotation: defaultPose.rotation + (p.rotation - defaultPose.rotation) * w,
        x: p.x * w,
        y: p.y * w,
        scaleX: 1 + ((p.scaleX ?? 1) - 1) * w,
        scaleY: 1 + ((p.scaleY ?? 1) - 1) * w,
      };
    });
    return pose as PuppetPose;
  };

  // Helper to draw a single SVG frame onto a canvas without flickering
  const drawFrameToCanvas = (
    ctx: CanvasRenderingContext2D,
    pose: PuppetPose,
    width: number,
    height: number,
    mode: ExportBackgroundMode
  ): Promise<void> => {
    return new Promise((resolve) => {
      const svgString = generateStaticPoseSvg(pose, pivots, width, height, customSvg);
      const img = new Image();
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const renderBackground = () => {
        if (mode === 'transparent') {
          ctx.clearRect(0, 0, width, height);
        } else {
          const color = mode === 'white' ? '#ffffff' : mode === 'green' ? '#00ff00' : '#171717';
          ctx.fillStyle = color;
          ctx.fillRect(0, 0, width, height);
        }
      };

      img.onload = () => {
        renderBackground();
        // Center the character within the target canvas frame with 5% margin
        const minDim = Math.min(width, height);
        const drawW = minDim * 0.9;
        const drawH = minDim * 0.9;
        const drawX = (width - drawW) / 2;
        const drawY = (height - drawH) / 2;
        ctx.drawImage(img, drawX, drawY, drawW, drawH);
        URL.revokeObjectURL(url);
        resolve();
      };
      img.onerror = () => {
        renderBackground();
        URL.revokeObjectURL(url);
        resolve();
      };
      img.src = url;
    });
  };

  // 1. Standalone Animated SVG
  const handleExportSvg = () => {
    const svgContent = generateAnimatedSvg(exportTracks, exportDuration, 30, pivots, customSvg);
    triggerFileDownload(
      svgContent,
      `${title}_${exportDuration.toFixed(1)}s.svg`,
      'image/svg+xml'
    );
  };

  // 2. Export WebM Video (100% Flicker-Free & Wall-Clock Synchronized Duration with Alpha Transparency)
  const handleRecordVideo = async () => {
    if (isRenderingVideo || isRenderingZip || isRenderingSinglePng) return;
    try {
      setIsRenderingVideo(true);
      setProgressMsg(`Initializing ${exportWidth}×${exportHeight} WebM rendering engine...`);

      const width = exportWidth;
      const height = exportHeight;
      const fps = 30;
      const totalFrames = Math.max(15, Math.round(exportDuration * fps));

      // Phase 1: Pre-render all frames to offscreen buffers with alpha transparency support.
      const renderedFrames: HTMLCanvasElement[] = [];
      for (let f = 0; f < totalFrames; f++) {
        const t = (f / totalFrames) * exportDuration;
        const pose = evaluatePoseAtTime(t);
        const fCanvas = document.createElement('canvas');
        fCanvas.width = width;
        fCanvas.height = height;
        const fCtx = fCanvas.getContext('2d', { alpha: true });
        if (fCtx) {
          await drawFrameToCanvas(fCtx, pose, width, height, bgMode);
        }
        renderedFrames.push(fCanvas);

        if (f % 6 === 0 || f === totalFrames - 1) {
          setProgressMsg(
            `Rendering frames (${width}×${height}): ${Math.round(((f + 1) / totalFrames) * 100)}% (${f + 1}/${totalFrames})`
          );
          // Yield to browser event loop for UI responsiveness
          await new Promise((r) => setTimeout(r, 0));
        }
      }

      // Phase 2: Setup stream canvas primed with frame 0
      const streamCanvas = document.createElement('canvas');
      streamCanvas.width = width;
      streamCanvas.height = height;
      const sCtx = streamCanvas.getContext('2d', { alpha: true });
      if (!sCtx) throw new Error('Canvas context unavailable');

      // Pre-draw frame 0 so the recorder captures frame 0 cleanly with transparent alpha
      sCtx.clearRect(0, 0, width, height);
      if (bgMode !== 'transparent') {
        const color = bgMode === 'white' ? '#ffffff' : bgMode === 'green' ? '#00ff00' : '#171717';
        sCtx.fillStyle = color;
        sCtx.fillRect(0, 0, width, height);
      }
      sCtx.drawImage(renderedFrames[0], 0, 0);

      const stream = streamCanvas.captureStream(fps);

      // Prioritize WebM formats with VP9/VP8 alpha support
      let mimeType = 'video/webm';
      const candidateMimes = [
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8',
        'video/webm;codecs=vp8,opus',
        'video/webm',
      ];
      for (const candidate of candidateMimes) {
        if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(candidate)) {
          mimeType = candidate;
          break;
        }
      }

      const bitrate = Math.max(
        4000000,
        Math.min(25000000, Math.round(width * height * fps * 0.2))
      );

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: bitrate,
      });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      const recorderStoppedPromise = new Promise<Blob>((resolve) => {
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          resolve(blob);
        };
      });

      // Start recording and pace frames using high-resolution wall-clock time
      recorder.start();
      const recordStartTime = performance.now();
      const frameIntervalMs = 1000 / fps;

      for (let f = 0; f < totalFrames; f++) {
        const targetTime = recordStartTime + f * frameIntervalMs;
        const delay = targetTime - performance.now();
        if (delay > 2) {
          await new Promise((r) => setTimeout(r, delay));
        }

        // Synchronously clear then blit next frame to ensure alpha transparency does not stack
        sCtx.clearRect(0, 0, width, height);
        if (bgMode !== 'transparent') {
          const color = bgMode === 'white' ? '#ffffff' : bgMode === 'green' ? '#00ff00' : '#171717';
          sCtx.fillStyle = color;
          sCtx.fillRect(0, 0, width, height);
        }
        sCtx.drawImage(renderedFrames[f], 0, 0);

        if (f % 6 === 0 || f === totalFrames - 1) {
          const elapsedSec = ((f + 1) / fps).toFixed(1);
          setProgressMsg(
            `Encoding WebM (${width}×${height}): ${Math.round(((f + 1) / totalFrames) * 100)}% (${elapsedSec}s / ${exportDuration.toFixed(1)}s)`
          );
        }
      }

      // Allow final frame to persist for its full frame duration
      const totalPlannedDurationMs = exportDuration * 1000;
      const remainingTime = totalPlannedDurationMs - (performance.now() - recordStartTime);
      if (remainingTime > 0) {
        await new Promise((r) => setTimeout(r, remainingTime));
      }

      recorder.stop();
      const rawBlob = await recorderStoppedPromise;

      // Phase 3: Patch WebM EBML duration header so video players report the exact length and allow scrubbing
      setProgressMsg('Injecting WebM duration metadata...');
      const durationMs = Math.round(exportDuration * 1000);
      let finalBlob = rawBlob;
      try {
        finalBlob = await fixWebmDuration(rawBlob, durationMs);
      } catch (patchErr) {
        console.warn('Could not patch WebM duration header, using raw blob:', patchErr);
      }

      const url = URL.createObjectURL(finalBlob);
      setLastExportedVideoUrl(url);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}_${width}x${height}_${exportDuration.toFixed(1)}s.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: any) {
      console.error('Video recording failed:', err);
      alert('Could not render video: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsRenderingVideo(false);
      setProgressMsg('');
    }
  };

  // 3. Export as Series of PNGs (ZIP Archive)
  const handleExportPngZip = async () => {
    if (isRenderingVideo || isRenderingZip || isRenderingSinglePng) return;
    try {
      setIsRenderingZip(true);
      setProgressMsg(`Initializing PNG sequence renderer (${exportWidth}×${exportHeight})...`);

      const zip = new JSZip();
      const width = exportWidth;
      const height = exportHeight;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { alpha: true });
      if (!ctx) throw new Error('Canvas context unavailable');

      const fps = 30;
      const totalFrames = Math.max(15, Math.round(exportDuration * fps));

      for (let f = 0; f < totalFrames; f++) {
        const t = (f / totalFrames) * exportDuration;
        const pose = evaluatePoseAtTime(t);
        await drawFrameToCanvas(ctx, pose, width, height, bgMode);

        const frameBlob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((b) => resolve(b), 'image/png');
        });

        if (frameBlob) {
          const frameNum = String(f + 1).padStart(4, '0');
          zip.file(`frame_${frameNum}.png`, frameBlob);
        }

        setProgressMsg(`Rendering PNG (${width}×${height}): ${f + 1} / ${totalFrames}`);
        await new Promise((r) => setTimeout(r, 4));
      }

      setProgressMsg('Compressing ZIP archive...');
      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });

      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}_${width}x${height}_png_sequence_${totalFrames}frames.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('PNG series export failed:', err);
      alert('Could not generate PNG sequence: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsRenderingZip(false);
      setProgressMsg('');
    }
  };

  // 4. Download Single High-Res PNG Snapshot of Active Pose
  const handleExportSinglePng = async () => {
    if (isRenderingVideo || isRenderingZip || isRenderingSinglePng) return;
    try {
      setIsRenderingSinglePng(true);
      const width = exportWidth;
      const height = exportHeight;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { alpha: true });
      if (!ctx) throw new Error('Canvas context unavailable');

      await drawFrameToCanvas(ctx, currentPose, width, height, bgMode);
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/png');
      });

      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title}_${width}x${height}_pose.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err: any) {
      alert('Could not export PNG snapshot: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsRenderingSinglePng(false);
    }
  };

  // 5. Save JSON Timeline
  const handleExportJson = () => {
    const projectData = {
      version: '1.1',
      title: title,
      duration: exportDuration,
      fps: timeline.fps,
      tracks: exportTracks,
      pivots: pivots,
    };
    const jsonStr = JSON.stringify(projectData, null, 2);
    triggerFileDownload(jsonStr, `${title}.json`, 'application/json');
  };

  // 6. Load JSON Timeline
  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data.tracks) {
          onImportTracks({
            duration: data.duration || timeline.duration,
            tracks: data.tracks,
            pivots: data.pivots,
          });
          onClose();
        }
      } catch (err) {
        alert('Invalid JSON animation file format.');
      }
    };
    reader.readAsText(file);
  };

  // 7. Copy Static SVG
  const handleCopySvgPose = () => {
    const staticSvg = generateStaticPoseSvg(currentPose, pivots, undefined, undefined, customSvg);
    navigator.clipboard.writeText(staticSvg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-3 border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-sky-400" />
            <h2 className="text-base font-bold text-white">Export & Share Performance</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isRenderingVideo || isRenderingZip || isRenderingSinglePng}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors disabled:opacity-30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Animation Source Selector & Duration Settings */}
          <div className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Source Animation to Export:
              </label>
              <span className="text-[11px] font-mono text-sky-400">
                Duration: {exportDuration.toFixed(1)}s ({Math.round(exportDuration * 30)} frames @ 30 FPS)
              </span>
            </div>

            <select
              id="export-source-select"
              value={selectedSource}
              onChange={(e) => handleSourceChange(e.target.value)}
              disabled={isRenderingVideo || isRenderingZip || isRenderingSinglePng}
              className="w-full py-2 px-3 rounded-lg bg-neutral-900 border border-neutral-700 text-xs font-medium text-white focus:outline-none focus:border-sky-500"
            >
              <option value="current">
                🎯 Current Performance (Your Recorded Layers)
              </option>
              <optgroup label="Built-in Performance Presets">
                {PRESET_ANIMATIONS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    ⭐ Preset: {preset.name} ({preset.duration}s)
                  </option>
                ))}
              </optgroup>
            </select>

            {/* Export Duration Customizer */}
            <div className="pt-2 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span className="font-semibold text-neutral-300">Target Duration:</span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {selectedSource === 'current' && recordedKeyframeDuration && (
                  <button
                    id="btn-match-recorded-length"
                    type="button"
                    onClick={() => setCustomDuration(recordedKeyframeDuration)}
                    className={`px-2 py-1 rounded text-[11px] font-medium border transition-colors ${
                      exportDuration === recordedKeyframeDuration
                        ? 'bg-sky-500/25 border-sky-400 text-sky-300 font-bold'
                        : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:text-white'
                    }`}
                    title="Match length to last recorded keyframe"
                  >
                    Recorded ({recordedKeyframeDuration}s)
                  </button>
                )}

                {selectedSource === 'current' && (
                  <button
                    id="btn-match-timeline-length"
                    type="button"
                    onClick={() => setCustomDuration(timeline.duration)}
                    className={`px-2 py-1 rounded text-[11px] font-medium border transition-colors ${
                      exportDuration === timeline.duration &&
                      (!recordedKeyframeDuration || exportDuration !== recordedKeyframeDuration)
                        ? 'bg-sky-500/25 border-sky-400 text-sky-300 font-bold'
                        : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:text-white'
                    }`}
                    title="Export full timeline length"
                  >
                    Timeline ({timeline.duration.toFixed(1)}s)
                  </button>
                )}

                <select
                  id="select-export-custom-duration"
                  value={['1.0', '2.0', '3.0', '4.0', '5.0', '6.0', '8.0', '10.0'].includes(exportDuration.toFixed(1)) ? exportDuration.toFixed(1) : 'custom'}
                  onChange={(e) => {
                    if (e.target.value !== 'custom') {
                      setCustomDuration(parseFloat(e.target.value));
                    }
                  }}
                  disabled={isRenderingVideo || isRenderingZip || isRenderingSinglePng}
                  className="py-1 px-2 rounded bg-neutral-900 border border-neutral-700 text-[11px] font-mono text-neutral-200 focus:outline-none focus:border-sky-500"
                >
                  <option value="1.0">1.0s</option>
                  <option value="2.0">2.0s</option>
                  <option value="3.0">3.0s</option>
                  <option value="4.0">4.0s</option>
                  <option value="5.0">5.0s</option>
                  <option value="6.0">6.0s</option>
                  <option value="8.0">8.0s</option>
                  <option value="10.0">10.0s</option>
                  <option value="custom">Custom...</option>
                </select>

                <div className="flex items-center gap-0.5">
                  <input
                    type="number"
                    id="input-export-exact-duration"
                    step="0.1"
                    min="0.5"
                    max="120.0"
                    value={exportDuration.toFixed(1)}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val) && val >= 0.5) {
                        setCustomDuration(Math.round(val * 10) / 10);
                      }
                    }}
                    disabled={isRenderingVideo || isRenderingZip || isRenderingSinglePng}
                    className="w-14 bg-neutral-900 border border-neutral-700 hover:border-sky-500 focus:border-sky-400 text-sky-300 font-mono text-[11px] text-center rounded px-1 py-1 focus:outline-none font-bold disabled:opacity-50"
                    title="Type exact clip duration with 0.1s accuracy"
                  />
                  <span className="text-[11px] text-neutral-400 font-mono">s</span>
                </div>
              </div>
            </div>
          </div>

          {/* Export Resolution Settings Card */}
          <div className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
                Export Resolution (WebM & PNG):
              </label>
              <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                {exportWidth} × {exportHeight} px • {((exportWidth * exportHeight) / 1000000).toFixed(2)} MP
              </span>
            </div>

            {/* Resolution Preset Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {RESOLUTION_PRESETS.map((preset) => {
                const isSelected = selectedResolutionId === preset.id;
                return (
                  <button
                    key={preset.id}
                    id={`export-res-${preset.id}`}
                    type="button"
                    disabled={isRenderingVideo || isRenderingZip || isRenderingSinglePng}
                    onClick={() => {
                      setSelectedResolutionId(preset.id);
                      if (preset.id !== 'custom') {
                        setCustomWidth(preset.width);
                        setCustomHeight(preset.height);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                      isSelected
                        ? 'bg-sky-500/25 border-sky-400 text-sky-300 font-bold shadow-sm'
                        : 'bg-neutral-900 border-neutral-700/80 text-neutral-300 hover:text-white hover:border-neutral-600'
                    } disabled:opacity-50`}
                    title={`${preset.description} (${preset.aspect})`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {/* Custom Width & Height Inputs */}
            {selectedResolutionId === 'custom' && (
              <div className="pt-2 border-t border-neutral-800 flex items-center gap-3 animate-in fade-in flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-neutral-400 font-medium">Width:</span>
                  <input
                    id="export-custom-width"
                    type="number"
                    min={100}
                    max={3840}
                    step={10}
                    value={customWidth}
                    onChange={(e) => {
                      const val = Math.max(100, Math.min(3840, parseInt(e.target.value) || 100));
                      setCustomWidth(val);
                      if (lockAspectRatio) {
                        setCustomHeight(val);
                      }
                    }}
                    className="w-20 py-1 px-2 rounded bg-neutral-900 border border-neutral-700 text-xs font-mono text-white focus:outline-none focus:border-sky-500"
                  />
                  <span className="text-[11px] text-neutral-500">px</span>
                </div>

                <button
                  type="button"
                  onClick={() => setLockAspectRatio(!lockAspectRatio)}
                  className={`p-1.5 rounded-lg text-xs border transition-colors ${
                    lockAspectRatio
                      ? 'bg-sky-500/20 border-sky-500/50 text-sky-400'
                      : 'bg-neutral-900 border-neutral-700 text-neutral-500 hover:text-neutral-300'
                  }`}
                  title={lockAspectRatio ? '1:1 Ratio Locked' : 'Aspect Ratio Unlocked'}
                >
                  {lockAspectRatio ? <Link className="w-3.5 h-3.5" /> : <Unlink className="w-3.5 h-3.5" />}
                </button>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-neutral-400 font-medium">Height:</span>
                  <input
                    id="export-custom-height"
                    type="number"
                    min={100}
                    max={3840}
                    step={10}
                    value={customHeight}
                    onChange={(e) => {
                      const val = Math.max(100, Math.min(3840, parseInt(e.target.value) || 100));
                      setCustomHeight(val);
                      if (lockAspectRatio) {
                        setCustomWidth(val);
                      }
                    }}
                    className="w-20 py-1 px-2 rounded bg-neutral-900 border border-neutral-700 text-xs font-mono text-white focus:outline-none focus:border-sky-500"
                  />
                  <span className="text-[11px] text-neutral-500">px</span>
                </div>

                <span className="text-[11px] text-neutral-500 ml-auto">
                  Range: 100–3840px
                </span>
              </div>
            )}
          </div>

          {/* Background Canvas Settings Card */}
          <div className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Background Canvas (WebM Video & PNG):
              </label>
              <span className={`text-[11px] font-mono font-medium ${bgMode === 'transparent' ? 'text-emerald-400 font-semibold' : 'text-neutral-400'}`}>
                {bgMode === 'transparent' ? 'Alpha Channel (Transparent)' : `${bgMode.toUpperCase()} Solid Fill`}
              </span>
            </div>

            {/* Background Style Selector Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                id="export-bg-transparent"
                disabled={isRenderingVideo || isRenderingZip || isRenderingSinglePng}
                onClick={() => setBgMode('transparent')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-2 transition-colors ${
                  bgMode === 'transparent'
                    ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300 font-bold shadow-sm'
                    : 'bg-neutral-900 border-neutral-700/80 text-neutral-300 hover:text-white hover:border-neutral-600'
                } disabled:opacity-50`}
                title="True 8-bit Alpha transparency for WebM and PNG"
              >
                <span className="w-3.5 h-3.5 rounded-sm border border-neutral-600 bg-[linear-gradient(45deg,#555_25%,transparent_25%),linear-gradient(-45deg,#555_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#555_75%),linear-gradient(-45deg,transparent_75%,#555_75%)] bg-[size:6px_6px] bg-neutral-800 inline-block shrink-0" />
                Transparent (Alpha)
              </button>

              <button
                type="button"
                id="export-bg-dark"
                disabled={isRenderingVideo || isRenderingZip || isRenderingSinglePng}
                onClick={() => setBgMode('dark')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-2 transition-colors ${
                  bgMode === 'dark'
                    ? 'bg-sky-500/25 border-sky-400 text-sky-300 font-bold shadow-sm'
                    : 'bg-neutral-900 border-neutral-700/80 text-neutral-300 hover:text-white hover:border-neutral-600'
                } disabled:opacity-50`}
                title="Solid dark charcoal studio background"
              >
                <span className="w-3.5 h-3.5 rounded-sm bg-[#171717] border border-neutral-600 inline-block shrink-0" />
                Dark Neutral (#171717)
              </button>

              <button
                type="button"
                id="export-bg-white"
                disabled={isRenderingVideo || isRenderingZip || isRenderingSinglePng}
                onClick={() => setBgMode('white')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-2 transition-colors ${
                  bgMode === 'white'
                    ? 'bg-sky-500/25 border-sky-400 text-sky-300 font-bold shadow-sm'
                    : 'bg-neutral-900 border-neutral-700/80 text-neutral-300 hover:text-white hover:border-neutral-600'
                } disabled:opacity-50`}
                title="Solid clean white background"
              >
                <span className="w-3.5 h-3.5 rounded-sm bg-white border border-neutral-400 inline-block shrink-0" />
                Clean White
              </button>

              <button
                type="button"
                id="export-bg-green"
                disabled={isRenderingVideo || isRenderingZip || isRenderingSinglePng}
                onClick={() => setBgMode('green')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-2 transition-colors ${
                  bgMode === 'green'
                    ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300 font-bold shadow-sm'
                    : 'bg-neutral-900 border-neutral-700/80 text-neutral-300 hover:text-white hover:border-neutral-600'
                } disabled:opacity-50`}
                title="Chroma key green screen background for video editors"
              >
                <span className="w-3.5 h-3.5 rounded-sm bg-[#00ff00] border border-neutral-600 inline-block shrink-0" />
                Green Screen (#00FF00)
              </button>
            </div>

            <p className="text-[11px] text-neutral-400 leading-relaxed">
              {bgMode === 'transparent'
                ? '✨ Transparent background enabled: WebM video is encoded with VP9/VP8 alpha channels. Video editing software (Premiere, DaVinci Resolve, After Effects, Final Cut), streaming apps (OBS Studio), and web browsers will render with full transparency behind the character.'
                : `Solid ${bgMode} canvas enabled: All exported frames will be rendered with an opaque ${bgMode} background.`}
            </p>
          </div>

          {/* Exported Video Verification & Preview Player */}
          {lastExportedVideoUrl && (
            <div className="p-4 rounded-xl bg-neutral-950/90 border border-emerald-500/50 space-y-3 animate-in fade-in shadow-lg">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">WebM Render Complete & Downloaded</h4>
                    <span className="text-[10px] text-neutral-400">
                      {exportWidth}×{exportHeight} • {bgMode === 'transparent' ? 'Alpha Transparency Active' : `${bgMode} background`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="text-neutral-400 text-[10px] font-medium">Verify Canvas:</span>
                  <button
                    type="button"
                    onClick={() => setPreviewBg('checkerboard')}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                      previewBg === 'checkerboard'
                        ? 'bg-sky-500/25 border-sky-400 text-sky-300 font-bold'
                        : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:text-white'
                    }`}
                  >
                    🏁 Checkerboard
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewBg('white')}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                      previewBg === 'white'
                        ? 'bg-sky-500/25 border-sky-400 text-sky-300 font-bold'
                        : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:text-white'
                    }`}
                  >
                    ⬜ White
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewBg('dark')}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                      previewBg === 'dark'
                        ? 'bg-sky-500/25 border-sky-400 text-sky-300 font-bold'
                        : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:text-white'
                    }`}
                  >
                    ⬛ Dark
                  </button>
                </div>
              </div>

              {/* Video Player over chosen background */}
              <div
                className={`relative w-full h-48 rounded-lg overflow-hidden flex items-center justify-center border border-neutral-800 transition-colors ${
                  previewBg === 'checkerboard'
                    ? 'bg-[linear-gradient(45deg,#333_25%,transparent_25%),linear-gradient(-45deg,#333_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#333_75%),linear-gradient(-45deg,transparent_75%,#333_75%)] bg-[size:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0px] bg-neutral-900'
                    : previewBg === 'white'
                    ? 'bg-white'
                    : 'bg-neutral-950'
                }`}
              >
                <video
                  src={lastExportedVideoUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
                <span>
                  {bgMode === 'transparent'
                    ? '💡 The checkerboard pattern reveals the true transparent alpha pixels underneath the character.'
                    : `Video rendered with solid ${bgMode} canvas.`}
                </span>
                <a
                  href={lastExportedVideoUrl}
                  download={`${title}_${exportWidth}x${exportHeight}_${exportDuration.toFixed(1)}s.webm`}
                  className="text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Re-download WebM
                </a>
              </div>
            </div>
          )}

          {/* Active Progress Banner if Rendering */}
          {(isRenderingVideo || isRenderingZip) && (
            <div className="p-3 rounded-xl bg-sky-950/70 border border-sky-600/50 flex items-center gap-3 animate-pulse">
              <Loader2 className="w-5 h-5 text-sky-400 animate-spin shrink-0" />
              <div className="text-xs font-medium text-sky-200">
                {progressMsg || 'Rendering in progress...'}
              </div>
            </div>
          )}

          {/* Export Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* OPTION 1: WebM Video */}
            <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-2.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose-400">
                    <Video className="w-4 h-4" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                      Render WebM Video
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-semibold text-rose-400/90 bg-rose-950/50 px-1.5 py-0.5 rounded border border-rose-800/40">
                      {exportWidth}×{exportHeight}
                    </span>
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${
                        bgMode === 'transparent'
                          ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300 font-semibold'
                          : 'bg-neutral-800 border-neutral-700 text-neutral-300'
                      }`}
                    >
                      {bgMode === 'transparent' ? '✓ Alpha Transparent' : bgMode}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  {bgMode === 'transparent'
                    ? `Smooth 30 FPS WebM with transparent alpha background (${exportWidth}×${exportHeight}) for video editors, OBS, and websites.`
                    : `Smooth 30 FPS video clip encoded at ${exportWidth}×${exportHeight} with ${bgMode} canvas.`}
                </p>
              </div>
              <button
                id="modal-render-webm-video"
                onClick={handleRecordVideo}
                disabled={isRenderingVideo || isRenderingZip || isRenderingSinglePng}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold transition-colors shadow-sm"
              >
                <Video className="w-3.5 h-3.5" />
                {isRenderingVideo ? 'Encoding WebM...' : `Export WebM (${exportWidth}×${exportHeight}, ${exportDuration.toFixed(1)}s)`}
              </button>
            </div>

            {/* OPTION 2: PNG Sequence ZIP */}
            <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-2.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Images className="w-4 h-4" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                      PNG Series & Frames
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-semibold text-emerald-400/90 bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-800/40">
                      {exportWidth}×{exportHeight}
                    </span>
                    <button
                      type="button"
                      onClick={() => setBgMode(bgMode === 'transparent' ? 'dark' : 'transparent')}
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded border transition-colors ${
                        bgMode === 'transparent'
                          ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300 font-semibold'
                          : 'bg-neutral-800 border-neutral-700 text-neutral-300'
                      }`}
                      title="Click to toggle transparent alpha background"
                    >
                      {bgMode === 'transparent' ? '✓ Alpha Transparent' : 'Opaque'}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  High-res {exportWidth}×{exportHeight} frame sequence archive (.zip) or instant single pose snapshot with {bgMode} canvas.
                </p>
              </div>
              <div className="space-y-1.5">
                <button
                  id="modal-export-png-sequence"
                  onClick={handleExportPngZip}
                  disabled={isRenderingVideo || isRenderingZip || isRenderingSinglePng}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition-colors shadow-sm"
                >
                  <Archive className="w-3.5 h-3.5" />
                  {isRenderingZip ? 'Rendering Frames...' : `Export PNG Series (${exportWidth}×{exportHeight})`}
                </button>

                <button
                  id="modal-export-single-png"
                  type="button"
                  onClick={handleExportSinglePng}
                  disabled={isRenderingVideo || isRenderingZip || isRenderingSinglePng}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-neutral-200 text-xs font-medium transition-colors"
                  title="Download single high-resolution PNG of the current pose"
                >
                  <Camera className="w-3 h-3 text-emerald-400" />
                  {isRenderingSinglePng ? 'Saving PNG...' : `Snapshot Current Pose (${exportWidth}×${exportHeight} PNG)`}
                </button>
              </div>
            </div>

            {/* OPTION 3: Standalone Animated SVG */}
            <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-2.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-sky-400">
                  <FileCode className="w-4 h-4" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                    Animated SVG
                  </h3>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  Pure CSS @keyframes vector animation. Zero dependencies, infinite vector scaling.
                </p>
              </div>
              <button
                id="modal-download-animated-svg"
                onClick={handleExportSvg}
                disabled={isRenderingVideo || isRenderingZip || isRenderingSinglePng}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Download .SVG
              </button>
            </div>

            {/* OPTION 4: Project JSON & Vector Pose */}
            <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-2.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-violet-400">
                  <Code className="w-4 h-4" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                    JSON Project & Pose
                  </h3>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  Save full timeline keyframe data for all body parts, or copy active pose vector.
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  id="modal-download-json"
                  onClick={handleExportJson}
                  disabled={isRenderingVideo || isRenderingZip || isRenderingSinglePng}
                  className="flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
                >
                  <Download className="w-3 h-3" /> Save JSON
                </button>

                <label
                  className="flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold cursor-pointer transition-colors"
                >
                  <Upload className="w-3 h-3" /> Load
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportJsonFile}
                    className="hidden"
                  />
                </label>

                <button
                  id="modal-copy-svg-pose"
                  onClick={handleCopySvgPose}
                  disabled={isRenderingVideo || isRenderingZip || isRenderingSinglePng}
                  className="flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
                  title="Copy current frame SVG markup"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Pose'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="py-2.5 px-5 bg-neutral-950/80 border-t border-neutral-800/80 text-center text-[11px] text-neutral-500 shrink-0">
          Character: <span className="font-semibold text-neutral-300">taxesFront</span> Piggy • 10-Limb Rig • Source: <span className="text-sky-400 font-medium">{title}</span> • Target: <span className="text-emerald-400 font-mono font-medium">{exportWidth}×{exportHeight}</span>
        </div>
      </div>
    </div>
  );
};
