import React, { useState } from 'react';
import { DEFAULT_PIVOTS, LIMB_CONFIGS, PIVOT_PRESETS } from '../constants/defaultCharacter';
import { PRESET_ANIMATIONS } from '../utils/presetAnimations';
import { LimbId, LimbPivots, PuppetPose, WebcamMapping, WebcamTrackingState } from '../types';
import {
  Camera,
  CameraOff,
  Crosshair,
  Gamepad2,
  Library,
  MousePointer2,
  Play,
  RotateCcw,
  RotateCw,
  Sliders,
  Sparkles,
  Zap,
  Lock,
  Unlock,
  Pin,
  Check,
} from 'lucide-react';

interface PuppeteerControllerProps {
  selectedLimb: LimbId | null;
  currentPose: PuppetPose;
  pivots: LimbPivots;
  onPivotChange: (limbId: LimbId, pivot: { x: number; y: number }) => void;
  onResetPivot: (limbId: LimbId) => void;
  isEditingPivot: boolean;
  onToggleEditPivot: (editing?: boolean) => void;
  onPoseChange: (limbId: LimbId, partialPose: Partial<{ rotation: number; x: number; y: number; scaleX: number; scaleY: number }>) => void;
  webcamState: WebcamTrackingState;
  webcamError: string | null;
  onStartWebcam: () => void;
  onStopWebcam: () => void;
  onCalibrateWebcam: () => void;
  onSetWebcamSensitivity: (val: number) => void;
  onSetWebcamSmoothing: (val: number) => void;
  onUpdateWebcamMapping: (index: number, partial: Partial<WebcamMapping>) => void;
  onSetTargetLimb?: (limbId: LimbId) => void;
  onLoadPreset: (presetId: string, targetLimbOnly?: LimbId) => void;
  onResetPose: () => void;
  onMirrorPose: () => void;
  unlock360Rotation?: boolean;
  onToggle360Rotation?: (unlock: boolean) => void;
  onSetStartPosition?: (limbId: LimbId) => void;
  onResetToStartPosition?: (limbId: LimbId) => void;
  startPositionFeedback?: string | null;
}

export const PuppeteerController: React.FC<PuppeteerControllerProps> = ({
  selectedLimb,
  currentPose,
  pivots,
  onPivotChange,
  onResetPivot,
  isEditingPivot,
  onToggleEditPivot,
  onPoseChange,
  webcamState,
  webcamError,
  onStartWebcam,
  onStopWebcam,
  onCalibrateWebcam,
  onSetWebcamSensitivity,
  onSetWebcamSmoothing,
  onUpdateWebcamMapping,
  onSetTargetLimb,
  onLoadPreset,
  onResetPose,
  onMirrorPose,
  unlock360Rotation = true,
  onToggle360Rotation,
  onSetStartPosition,
  onResetToStartPosition,
  startPositionFeedback,
}) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'webcam' | 'presets'>('manual');

  const activeConfig = selectedLimb ? LIMB_CONFIGS[selectedLimb] : null;
  const limbPose = selectedLimb ? currentPose[selectedLimb] : null;

  return (
    <div className="flex flex-col h-full bg-neutral-900/90 border border-neutral-800 rounded-xl overflow-hidden backdrop-blur-md">
      {/* Tab Navigation */}
      <div className="flex items-center border-b border-neutral-800 bg-neutral-950/40 p-1">
        <button
          id="tab-manual-btn"
          onClick={() => setActiveTab('manual')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'manual'
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <MousePointer2 className="w-3.5 h-3.5" />
          <span>Manual</span>
        </button>

        <button
          id="tab-webcam-btn"
          onClick={() => setActiveTab('webcam')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'webcam'
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Camera className={`w-3.5 h-3.5 ${webcamState.active ? 'text-emerald-400' : ''}`} />
          <span>Webcam</span>
          {webcamState.active && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          )}
        </button>

        <button
          id="tab-presets-btn"
          onClick={() => setActiveTab('presets')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'presets'
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Library className="w-3.5 h-3.5" />
          <span>Presets</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-thin">
        {/* TAB 1: MANUAL PUPPETEER CONTROLS */}
        {activeTab === 'manual' && (
          <div className="space-y-4">
            {selectedLimb && activeConfig && limbPose ? (
              <div className="space-y-4">
                {/* Header info */}
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: activeConfig.color }}
                    />
                    <h3 className="text-sm font-bold text-white">{activeConfig.name}</h3>
                  </div>
                  <span className="text-xs font-mono text-neutral-400">
                    {activeConfig.category.toUpperCase()}
                  </span>
                </div>

                {/* Rotation Slider & Dial */}
                <div className="space-y-1.5 bg-neutral-950/50 p-3 rounded-lg border border-neutral-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                      <RotateCw className="w-3.5 h-3.5 text-sky-400" />
                      Rotation
                    </label>
                    <div className="flex items-center gap-2">
                      {onToggle360Rotation && (
                        <button
                          id="controller-toggle-360-rotation-btn"
                          onClick={() => onToggle360Rotation(!unlock360Rotation)}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                            unlock360Rotation
                              ? 'bg-sky-500/20 text-sky-300 border-sky-400/50'
                              : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white'
                          }`}
                          title="Toggle full 360° rotation arc vs clamped angle span"
                        >
                          {unlock360Rotation ? <Unlock className="w-3 h-3 text-sky-400" /> : <Lock className="w-3 h-3" />}
                          <span>{unlock360Rotation ? '360° Free' : 'Locked Arc'}</span>
                        </button>
                      )}
                      <span className="text-xs font-mono font-bold text-sky-400">
                        {Math.round(limbPose.rotation)}°
                      </span>
                    </div>
                  </div>
                  <input
                    id="slider-limb-rotation"
                    type="range"
                    min={unlock360Rotation ? -180 : activeConfig.rotationRange[0]}
                    max={unlock360Rotation ? 180 : activeConfig.rotationRange[1]}
                    value={limbPose.rotation}
                    onChange={(e) =>
                      onPoseChange(selectedLimb, { rotation: parseFloat(e.target.value) })
                    }
                    className="w-full h-1.5 accent-sky-500 bg-neutral-700 rounded cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-neutral-500">
                    <span>{unlock360Rotation ? '-180°' : `${activeConfig.rotationRange[0]}°`}</span>
                    <button
                      onClick={() =>
                        onPoseChange(selectedLimb, { rotation: activeConfig.baseRotation })
                      }
                      className="hover:text-neutral-300 underline"
                    >
                      Reset ({activeConfig.baseRotation}°)
                    </button>
                    <span>{unlock360Rotation ? '+180°' : `${activeConfig.rotationRange[1]}°`}</span>
                  </div>

                  {/* 360 Degree Quick Angle Buttons */}
                  {unlock360Rotation && (
                    <div className="pt-1.5 flex items-center justify-between gap-1 text-[10px] font-mono">
                      <span className="text-neutral-500">Arc:</span>
                      {[-90, 0, 90, 180, 270].map((deg) => (
                        <button
                          key={deg}
                          type="button"
                          onClick={() => onPoseChange(selectedLimb, { rotation: deg })}
                          className={`px-1.5 py-0.5 rounded border transition-colors ${
                            Math.round(limbPose.rotation) === deg
                              ? 'bg-sky-500/20 border-sky-400 text-sky-300 font-bold'
                              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                          }`}
                        >
                          {deg}°
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2D Position (X & Y) */}
                <div className="space-y-2 bg-neutral-950/50 p-3 rounded-lg border border-neutral-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                      <Gamepad2 className="w-3.5 h-3.5 text-violet-400" />
                      Position Offset (Up / Down / Left / Right)
                    </label>
                    <span className="text-xs font-mono text-neutral-400">
                      X: {Math.round(limbPose.x)}, Y: {Math.round(limbPose.y)}
                    </span>
                  </div>

                  {/* Horizontal X Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-neutral-400">
                      <span>Horizontal (X)</span>
                      <span className="font-mono">{Math.round(limbPose.x)}px</span>
                    </div>
                    <input
                      id="slider-limb-x"
                      type="range"
                      min={-150}
                      max={150}
                      value={limbPose.x}
                      onChange={(e) => onPoseChange(selectedLimb, { x: parseFloat(e.target.value) })}
                      className="w-full h-1.5 accent-violet-500 bg-neutral-700 rounded cursor-pointer"
                    />
                  </div>

                  {/* Vertical Y Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-neutral-400">
                      <span>Vertical (Y)</span>
                      <span className="font-mono">{Math.round(limbPose.y)}px</span>
                    </div>
                    <input
                      id="slider-limb-y"
                      type="range"
                      min={-150}
                      max={150}
                      value={limbPose.y}
                      onChange={(e) => onPoseChange(selectedLimb, { y: parseFloat(e.target.value) })}
                      className="w-full h-1.5 accent-violet-500 bg-neutral-700 rounded cursor-pointer"
                    />
                  </div>
                </div>

                {/* Initial Start Position Card */}
                <div className="bg-neutral-950/70 p-3 rounded-lg border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                      <Pin className="w-3.5 h-3.5 text-emerald-400" />
                      Initial Start Position
                    </span>
                    {startPositionFeedback && (
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Saved!
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Set where <strong style={{ color: activeConfig.color }}>{activeConfig.name}</strong> begins before recording so you can move and rotate from this start position.
                  </p>
                  <div className="flex items-center gap-2 pt-0.5">
                    {onSetStartPosition && (
                      <button
                        id="controller-set-start-pos-btn"
                        onClick={() => onSetStartPosition(selectedLimb)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-sm"
                        title="Commit current position & rotation as the recording starting pose"
                      >
                        <Pin className="w-3.5 h-3.5" />
                        <span>Set as Start Position</span>
                      </button>
                    )}
                    {onResetToStartPosition && (
                      <button
                        id="controller-reset-to-start-btn"
                        onClick={() => onResetToStartPosition(selectedLimb)}
                        className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition-colors border border-neutral-700"
                        title="Return limb to saved start position"
                      >
                        Snap Start
                      </button>
                    )}
                    <button
                      id="controller-reset-rest-btn"
                      onClick={() => onPoseChange(selectedLimb, { x: 0, y: 0, rotation: activeConfig.baseRotation })}
                      className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white text-xs font-medium transition-colors border border-neutral-700"
                      title="Reset to pig rest origin (0, 0)"
                    >
                      Rest (0,0)
                    </button>
                  </div>
                </div>

                {/* Center of Motion (Pivot Point) Setting */}
                {(() => {
                  const currentPivot = pivots[selectedLimb] ?? activeConfig.pivot;
                  const defaultPivot = DEFAULT_PIVOTS[selectedLimb] ?? activeConfig.pivot;
                  const isCustomPivot =
                    Math.round(currentPivot.x) !== Math.round(defaultPivot.x) ||
                    Math.round(currentPivot.y) !== Math.round(defaultPivot.y);
                  const presets = PIVOT_PRESETS[selectedLimb] || [];

                  // Determine symmetrical opposite limb
                  const mirrorLimbMap: Partial<Record<LimbId, LimbId>> = {
                    handL: 'handR',
                    handR: 'handL',
                    footL: 'footR',
                    footR: 'footL',
                    earL: 'earR',
                    earR: 'earL',
                  };
                  const oppositeLimb = mirrorLimbMap[selectedLimb];

                  return (
                    <div className="space-y-3 bg-neutral-950/60 p-3 rounded-lg border border-neutral-800 transition-all">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Crosshair className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-xs font-semibold text-neutral-200">Center of Motion (Pivot)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {isCustomPivot ? (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              Custom
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">
                              Default
                            </span>
                          )}
                          <span className="text-xs font-mono font-bold text-amber-400">
                            ({Math.round(currentPivot.x)}, {Math.round(currentPivot.y)})
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-neutral-400 leading-snug">
                        The rotation & motion anchor point for <span className="text-neutral-200 font-medium">{activeConfig.name}</span>.
                      </p>

                      {/* Interactive Stage Mode Toggle Button */}
                      <button
                        id="toggle-move-center-mode-btn"
                        onClick={() => onToggleEditPivot(!isEditingPivot)}
                        className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                          isEditingPivot
                            ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 ring-2 ring-amber-400'
                            : 'bg-neutral-800/90 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
                        }`}
                      >
                        <Crosshair className={`w-3.5 h-3.5 ${isEditingPivot ? 'animate-spin' : 'text-amber-400'}`} />
                        <span>{isEditingPivot ? 'Editing Center on Stage (Click to Finish)' : 'Move Center on Canvas Stage'}</span>
                      </button>

                      {/* Coordinate Sliders & Inputs */}
                      <div className="space-y-2 pt-1 border-t border-neutral-800/80">
                        {/* Horizontal Center (X) */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[11px] text-neutral-400">
                            <span>Center X (Horizontal)</span>
                            <div className="flex items-center gap-1">
                              <input
                                id="input-pivot-x"
                                type="number"
                                min="0"
                                max="300"
                                value={Math.round(currentPivot.x)}
                                onChange={(e) => {
                                  const val = Math.max(0, Math.min(300, parseFloat(e.target.value) || 0));
                                  onPivotChange(selectedLimb, { x: val, y: currentPivot.y });
                                }}
                                className="w-12 bg-neutral-900 border border-neutral-700 rounded px-1 text-right font-mono text-[11px] text-white focus:outline-none focus:border-amber-500"
                              />
                              <span className="text-[10px] text-neutral-500">px</span>
                            </div>
                          </div>
                          <input
                            id="slider-pivot-x"
                            type="range"
                            min="0"
                            max="300"
                            value={currentPivot.x}
                            onChange={(e) =>
                              onPivotChange(selectedLimb, { x: parseFloat(e.target.value), y: currentPivot.y })
                            }
                            className="w-full h-1.5 accent-amber-500 bg-neutral-700 rounded cursor-pointer"
                          />
                        </div>

                        {/* Vertical Center (Y) */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[11px] text-neutral-400">
                            <span>Center Y (Vertical)</span>
                            <div className="flex items-center gap-1">
                              <input
                                id="input-pivot-y"
                                type="number"
                                min="0"
                                max="300"
                                value={Math.round(currentPivot.y)}
                                onChange={(e) => {
                                  const val = Math.max(0, Math.min(300, parseFloat(e.target.value) || 0));
                                  onPivotChange(selectedLimb, { x: currentPivot.x, y: val });
                                }}
                                className="w-12 bg-neutral-900 border border-neutral-700 rounded px-1 text-right font-mono text-[11px] text-white focus:outline-none focus:border-amber-500"
                              />
                              <span className="text-[10px] text-neutral-500">px</span>
                            </div>
                          </div>
                          <input
                            id="slider-pivot-y"
                            type="range"
                            min="0"
                            max="300"
                            value={currentPivot.y}
                            onChange={(e) =>
                              onPivotChange(selectedLimb, { x: currentPivot.x, y: parseFloat(e.target.value) })
                            }
                            className="w-full h-1.5 accent-amber-500 bg-neutral-700 rounded cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Anatomical Quick Presets */}
                      {presets.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                            Quick Joint Anchors
                          </span>
                          <div className="grid grid-cols-3 gap-1">
                            {presets.map((preset, idx) => {
                              const isActive =
                                Math.abs(currentPivot.x - preset.x) < 2 && Math.abs(currentPivot.y - preset.y) < 2;
                              return (
                                <button
                                  key={idx}
                                  onClick={() => onPivotChange(selectedLimb, { x: preset.x, y: preset.y })}
                                  className={`px-1.5 py-1 text-[10px] font-medium rounded truncate transition-colors ${
                                    isActive
                                      ? 'bg-amber-500 text-black font-bold shadow-sm'
                                      : 'bg-neutral-850 hover:bg-neutral-800 text-neutral-300 border border-neutral-750'
                                  }`}
                                  title={`${preset.label}: (${preset.x}, ${preset.y})`}
                                >
                                  {preset.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Action Footer: Reset & Symmetrical Mirror */}
                      <div className="flex items-center justify-between pt-1 border-t border-neutral-800/80">
                        <button
                          id="reset-pivot-btn"
                          disabled={!isCustomPivot}
                          onClick={() => onResetPivot(selectedLimb)}
                          className={`flex items-center gap-1 text-[11px] transition-colors ${
                            isCustomPivot
                              ? 'text-neutral-300 hover:text-white underline cursor-pointer'
                              : 'text-neutral-600 cursor-not-allowed'
                          }`}
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reset Default ({defaultPivot.x}, {defaultPivot.y})</span>
                        </button>

                        {oppositeLimb && (
                          <button
                            id="mirror-pivot-btn"
                            onClick={() => {
                              // Mirror across character center x = 150
                              const mirroredX = Math.round(300 - currentPivot.x);
                              onPivotChange(oppositeLimb, { x: mirroredX, y: currentPivot.y });
                            }}
                            className="text-[11px] text-amber-400 hover:text-amber-300 underline cursor-pointer"
                            title={`Copy symmetrical center to ${oppositeLimb}`}
                          >
                            Mirror to Opposite
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Squash & Stretch (For Body, Head, Snout) */}
                {['body', 'head', 'snout'].includes(selectedLimb) && (
                  <div className="space-y-1.5 bg-neutral-950/50 p-3 rounded-lg border border-neutral-800">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        Squash & Stretch
                      </label>
                      <span className="text-xs font-mono text-neutral-400">
                        {Math.round((limbPose.scaleY ?? 1) * 100)}%
                      </span>
                    </div>
                    <input
                      id="slider-limb-squash"
                      type="range"
                      min="0.7"
                      max="1.4"
                      step="0.02"
                      value={limbPose.scaleY ?? 1}
                      onChange={(e) => {
                        const sy = parseFloat(e.target.value);
                        // Inverse scaleX for realistic volume preservation
                        const sx = 1 / Math.sqrt(sy);
                        onPoseChange(selectedLimb, { scaleY: sy, scaleX: sx });
                      }}
                      className="w-full h-1.5 accent-amber-500 bg-neutral-700 rounded cursor-pointer"
                    />
                  </div>
                )}

                {/* Quick Puppeteering Gestures */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Quick Nudges
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id="quick-pose-nudge-left"
                      onClick={() =>
                        onPoseChange(selectedLimb, {
                          rotation: Math.max(activeConfig.rotationRange[0], limbPose.rotation - 15),
                        })
                      }
                      className="px-2 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-200 transition-colors"
                    >
                      Tilt -15°
                    </button>
                    <button
                      id="quick-pose-nudge-right"
                      onClick={() =>
                        onPoseChange(selectedLimb, {
                          rotation: Math.min(activeConfig.rotationRange[1], limbPose.rotation + 15),
                        })
                      }
                      className="px-2 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-200 transition-colors"
                    >
                      Tilt +15°
                    </button>
                    <button
                      id="quick-pose-bounce"
                      onClick={() =>
                        onPoseChange(selectedLimb, {
                          y: Math.max(activeConfig.yRange[0], limbPose.y - 12),
                        })
                      }
                      className="px-2 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-200 transition-colors"
                    >
                      Bounce Up
                    </button>
                    <button
                      id="quick-pose-reset-limb"
                      onClick={() =>
                        onPoseChange(selectedLimb, {
                          rotation: activeConfig.baseRotation,
                          x: 0,
                          y: 0,
                          scaleX: 1,
                          scaleY: 1,
                        })
                      }
                      className="px-2 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-200 transition-colors"
                    >
                      Zero Limb
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-500 space-y-2">
                <MousePointer2 className="w-8 h-8 mx-auto stroke-1 opacity-60" />
                <p className="text-xs">No limb selected.</p>
                <p className="text-[11px] text-neutral-600">
                  Click any body part in the stage or on the left layers rack.
                </p>
              </div>
            )}

            {/* Global Puppet Actions */}
            <div className="pt-3 border-t border-neutral-800 space-y-2">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Full Puppet Utilities
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  id="btn-mirror-pose"
                  onClick={onMirrorPose}
                  className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Mirror Pose
                </button>
                <button
                  id="btn-reset-full-pose"
                  onClick={onResetPose}
                  className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RotateCw className="w-3.5 h-3.5 text-neutral-400" />
                  Reset All
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: WEBCAM PUPPETEERING */}
        {activeTab === 'webcam' && (
          <div className="space-y-4">
            {/* Webcam activation banner */}
            <div className="bg-neutral-950/70 p-3 rounded-lg border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      webcamState.active ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-600'
                    }`}
                  />
                  <span className="text-xs font-bold text-white">
                    {webcamState.active ? 'Webcam Puppeteer Active' : 'Webcam Puppeteering'}
                  </span>
                </div>

                <button
                  id="btn-toggle-webcam"
                  onClick={webcamState.active ? onStopWebcam : onStartWebcam}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    webcamState.active
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                  }`}
                >
                  {webcamState.active ? (
                    <>
                      <CameraOff className="w-3.5 h-3.5" /> Stop
                    </>
                  ) : (
                    <>
                      <Camera className="w-3.5 h-3.5" /> Enable
                    </>
                  )}
                </button>
              </div>

              {webcamError && (
                <div className="p-2 rounded bg-rose-950/80 border border-rose-800 text-[11px] text-rose-300">
                  {webcamError}
                </div>
              )}

              {/* Target Body Part Selection for Webcam Puppeteering */}
              <div className="space-y-2 pt-2 border-t border-neutral-800">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-neutral-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    Target Body Part to Puppeteer:
                  </span>
                  <span
                    className="text-[11px] font-bold"
                    style={{ color: LIMB_CONFIGS[webcamState.targetLimb || 'handR']?.color || '#38bdf8' }}
                  >
                    {LIMB_CONFIGS[webcamState.targetLimb || 'handR']?.name}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1">
                  {[
                    { id: 'handR', label: 'Right Hand', icon: '🖐️' },
                    { id: 'handL', label: 'Left Hand', icon: '🖐️' },
                    { id: 'head', label: 'Head', icon: '🐷' },
                    { id: 'snout', label: 'Snout', icon: '👃' },
                    { id: 'body', label: 'Body', icon: '👕' },
                    { id: 'footR', label: 'Right Foot', icon: '🦶' },
                    { id: 'footL', label: 'Left Foot', icon: '🦶' },
                    { id: 'earL', label: 'Ears', icon: '👂' },
                  ].map((part) => {
                    const isTarget = (webcamState.targetLimb || 'handR') === part.id;
                    return (
                      <button
                        key={part.id}
                        id={`btn-webcam-target-${part.id}`}
                        onClick={() => {
                          if (onSetTargetLimb) onSetTargetLimb(part.id as LimbId);
                        }}
                        className={`py-1 px-1 rounded-md text-[10px] font-medium flex flex-col items-center gap-0.5 transition-colors ${
                          isTarget
                            ? 'bg-sky-600 text-white font-bold ring-1 ring-sky-400 shadow-sm'
                            : 'bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300'
                        }`}
                      >
                        <span className="text-xs">{part.icon}</span>
                        <span className="truncate w-full text-center leading-tight">{part.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ML Hand Landmarking Status & Feedback */}
              {webcamState.active && (
                <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">🖐️</span>
                      <span className="text-xs font-bold text-white">
                        ML Hand Tracker
                      </span>
                    </div>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                        webcamState.handDetected
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : webcamState.mlModelLoaded
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {webcamState.handDetected
                        ? `${webcamState.handType} Hand Locked`
                        : webcamState.mlModelLoaded
                        ? 'Waiting for Hand...'
                        : 'Loading Vision ML...'}
                    </span>
                  </div>

                  {webcamState.handDetected ? (
                    <div className="grid grid-cols-3 gap-1.5 text-center font-mono text-[10px]">
                      <div className="p-1 rounded bg-neutral-950 border border-neutral-800">
                        <div className="text-neutral-500">Hand Tilt</div>
                        <div className="text-emerald-400 font-bold">
                          {Math.round(webcamState.handAngle || 0)}°
                        </div>
                      </div>
                      <div className="p-1 rounded bg-neutral-950 border border-neutral-800">
                        <div className="text-neutral-500">Pinch / Scale</div>
                        <div className="text-sky-400 font-bold">
                          {Math.round((webcamState.pinchDistance || 0) * 100)}%
                        </div>
                      </div>
                      <div className="p-1 rounded bg-neutral-950 border border-neutral-800">
                        <div className="text-neutral-500">Position</div>
                        <div className="text-violet-400 font-bold">
                          {Math.round(webcamState.smoothedX)}px
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-neutral-400">
                      Hold your hand up in front of your camera to rotate, drag, and pinch-scale the selected body part in real time!
                    </p>
                  )}
                </div>
              )}

              {/* Tracking Metrics & Neutral Calibration */}
              {webcamState.active && (
                <div className="space-y-2 pt-2 border-t border-neutral-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-neutral-300 font-medium flex items-center gap-1">
                      Tracking: <span className="font-bold text-sky-400">{LIMB_CONFIGS[webcamState.targetLimb || 'handR']?.name}</span>
                    </span>
                    <button
                      id="btn-calibrate-webcam"
                      onClick={onCalibrateWebcam}
                      className="flex items-center gap-1 px-2 py-1 rounded bg-sky-600/30 hover:bg-sky-600/50 text-sky-300 border border-sky-500/40 text-[11px] font-medium transition-colors"
                      title="Set your current face position as the resting zero point"
                    >
                      <Crosshair className="w-3 h-3" />
                      Set Neutral Center
                    </button>
                  </div>

                  {/* Realtime Live Telemetry Meter */}
                  <div className="grid grid-cols-3 gap-1.5 text-center font-mono text-[10px]">
                    <div className="p-1.5 rounded bg-neutral-900 border border-neutral-800">
                      <div className="text-neutral-500">Tilt Angle</div>
                      <div className="text-sky-400 font-bold">
                        {Math.round(webcamState.smoothedTilt)}°
                      </div>
                    </div>
                    <div className="p-1.5 rounded bg-neutral-900 border border-neutral-800">
                      <div className="text-neutral-500">Offset X</div>
                      <div className="text-violet-400 font-bold">
                        {Math.round(webcamState.smoothedX)}px
                      </div>
                    </div>
                    <div className="p-1.5 rounded bg-neutral-900 border border-neutral-800">
                      <div className="text-neutral-500">Offset Y</div>
                      <div className="text-violet-400 font-bold">
                        {Math.round(webcamState.smoothedY)}px
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Webcam Tuning Controls */}
            <div className="space-y-3 bg-neutral-950/50 p-3 rounded-lg border border-neutral-800">
              <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-sky-400" />
                Motion Sensitivity & Smoothing
              </span>

              {/* Sensitivity */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-neutral-400">
                  <span>Sensitivity</span>
                  <span className="font-mono font-bold text-neutral-200">
                    {Math.round(webcamState.sensitivity * 100)}%
                  </span>
                </div>
                <input
                  id="slider-webcam-sensitivity"
                  type="range"
                  min="0.4"
                  max="2.5"
                  step="0.1"
                  value={webcamState.sensitivity}
                  onChange={(e) => onSetWebcamSensitivity(parseFloat(e.target.value))}
                  className="w-full h-1.5 accent-sky-500 bg-neutral-700 rounded cursor-pointer"
                />
              </div>

              {/* Smoothing */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-neutral-400">
                  <span>Smoothing (Jitter Reduction)</span>
                  <span className="font-mono font-bold text-neutral-200">
                    {Math.round(webcamState.smoothing * 100)}%
                  </span>
                </div>
                <input
                  id="slider-webcam-smoothing"
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.05"
                  value={webcamState.smoothing}
                  onChange={(e) => onSetWebcamSmoothing(parseFloat(e.target.value))}
                  className="w-full h-1.5 accent-sky-500 bg-neutral-700 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Motion Mapping Matrix */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Webcam to Limb Mappings
              </span>
              <div className="space-y-1.5">
                {webcamState.mappings.map((mapping, idx) => {
                  const limbConf = LIMB_CONFIGS[mapping.limbId];
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-neutral-950/60 border border-neutral-800 text-xs"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-sky-400 font-mono text-[11px] capitalize">
                          {mapping.source}
                        </span>
                        <span className="text-neutral-500">→</span>
                        <span
                          className="font-semibold"
                          style={{ color: limbConf?.color || '#fff' }}
                        >
                          {limbConf?.name}
                        </span>
                        <span className="text-neutral-500 text-[10px]">
                          ({mapping.parameter})
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            onUpdateWebcamMapping(idx, { invert: !mapping.invert })
                          }
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors ${
                            mapping.invert
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-neutral-800 text-neutral-400'
                          }`}
                          title="Invert Direction"
                        >
                          {mapping.invert ? 'INV' : 'NORM'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PRESETS & PERFORMANCE LIBRARY */}
        {activeTab === 'presets' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                Performance Library
              </span>
              <span className="text-[11px] text-neutral-500">
                {PRESET_ANIMATIONS.length} Presets
              </span>
            </div>

            <div className="space-y-2.5">
              {PRESET_ANIMATIONS.map((preset) => (
                <div
                  key={preset.id}
                  className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800 hover:border-neutral-700 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-white">{preset.name}</h4>
                      <p className="text-[11px] text-neutral-400 leading-snug mt-0.5">
                        {preset.description}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 shrink-0">
                      {preset.duration}s
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-neutral-800/80">
                    <button
                      id={`btn-load-preset-full-${preset.id}`}
                      onClick={() => onLoadPreset(preset.id)}
                      className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors shadow-sm"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      Apply All Layers
                    </button>

                    {selectedLimb && (
                      <button
                        id={`btn-load-preset-limb-${preset.id}`}
                        onClick={() => onLoadPreset(preset.id, selectedLimb)}
                        className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors"
                        title={`Apply only to current layer: ${LIMB_CONFIGS[selectedLimb].name}`}
                      >
                        Target Layer
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
