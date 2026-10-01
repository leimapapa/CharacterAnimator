import React from 'react';
import { LIMB_CONFIGS, LIMB_ORDER } from '../constants/defaultCharacter';
import { LayerTrack, LimbId, PuppetPose } from '../types';
import {
  CircleDot,
  Eye,
  EyeOff,
  Sliders,
  Sparkles,
  Trash2,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface LayerRackProps {
  tracks: Record<LimbId, LayerTrack>;
  currentPose: PuppetPose;
  selectedLimb: LimbId | null;
  onSelectLimb: (id: LimbId) => void;
  onToggleArm: (id: LimbId) => void;
  onToggleMute: (id: LimbId) => void;
  onToggleSolo: (id: LimbId) => void;
  onClearTrack: (id: LimbId) => void;
  onSmoothTrack: (id: LimbId) => void;
  onUpdateTrackWeight: (id: LimbId, weight: number) => void;
  isRecording: boolean;
}

export const LayerRack: React.FC<LayerRackProps> = ({
  tracks,
  currentPose,
  selectedLimb,
  onSelectLimb,
  onToggleArm,
  onToggleMute,
  onToggleSolo,
  onClearTrack,
  onSmoothTrack,
  onUpdateTrackWeight,
  isRecording,
}) => {
  return (
    <div className="flex flex-col h-full bg-neutral-900/90 border border-neutral-800 rounded-xl overflow-hidden backdrop-blur-md">
      {/* Header */}
      <div className="p-3 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-sky-500" />
          <h2 className="text-xs font-bold text-neutral-200 uppercase tracking-wider">
            Limb Layers Rack
          </h2>
        </div>
        <span className="text-[11px] text-neutral-500 font-mono">
          {(Object.values(tracks) as LayerTrack[]).filter((t) => t.keyframes.length > 0).length} / 10 Recorded
        </span>
      </div>

      {/* Rack Layer List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin">
        {LIMB_ORDER.map((limbId) => {
          const config = LIMB_CONFIGS[limbId];
          const track = tracks[limbId];
          const isSelected = selectedLimb === limbId;
          const pose = currentPose[limbId] || { rotation: 0, x: 0, y: 0 };
          const keyframeCount = track?.keyframes?.length || 0;
          const hasData = keyframeCount > 0;

          return (
            <div
              key={limbId}
              id={`layer-row-${limbId}`}
              onClick={() => onSelectLimb(limbId)}
              className={`group relative flex flex-col p-2 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-neutral-800/90 border-neutral-600 shadow-md ring-1'
                  : 'bg-neutral-900/50 border-neutral-800/80 hover:bg-neutral-800/50 hover:border-neutral-700'
              }`}
              style={{
                ringColor: isSelected ? config.color : undefined,
              }}
            >
              {/* Main row */}
              <div className="flex items-center justify-between gap-2">
                {/* Limb Accent Indicator & Name */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {/* Armed Status Button */}
                  <button
                    id={`arm-btn-${limbId}`}
                    title={track.isArmed ? 'Armed for Recording' : 'Click to Arm Layer for Recording'}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleArm(limbId);
                    }}
                    className={`p-1 rounded transition-colors ${
                      track.isArmed
                        ? 'text-rose-500 bg-rose-500/20 ring-1 ring-rose-500 animate-pulse'
                        : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-700/50'
                    }`}
                  >
                    <CircleDot className="w-3.5 h-3.5" />
                  </button>

                  {/* Color bar */}
                  <div
                    className="w-1.5 h-6 rounded-full shrink-0"
                    style={{ backgroundColor: config.color }}
                  />

                  {/* Info */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-xs font-semibold truncate ${
                          isSelected ? 'text-white' : 'text-neutral-300'
                        }`}
                      >
                        {config.name}
                      </span>
                      {hasData && (
                        <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-neutral-700/70 text-sky-300">
                          {keyframeCount} pts
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-neutral-400">
                      Rot: {Math.round(pose.rotation)}° {pose.x !== 0 && `| X: ${Math.round(pose.x)}`}
                    </div>
                  </div>
                </div>

                {/* Track Controls: Mute, Solo, Smooth, Clear */}
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {/* Solo button */}
                  <button
                    id={`solo-btn-${limbId}`}
                    title={track.isSolo ? 'Unsolo track' : 'Solo track'}
                    onClick={() => onToggleSolo(limbId)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
                      track.isSolo
                        ? 'bg-amber-500 text-black shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-300 bg-neutral-800'
                    }`}
                  >
                    S
                  </button>

                  {/* Mute button */}
                  <button
                    id={`mute-btn-${limbId}`}
                    title={track.isMuted ? 'Unmute track' : 'Mute track'}
                    onClick={() => onToggleMute(limbId)}
                    className={`p-1 rounded text-[10px] transition-colors ${
                      track.isMuted
                        ? 'bg-rose-900/60 text-rose-300 ring-1 ring-rose-500/50'
                        : 'text-neutral-500 hover:text-neutral-300 bg-neutral-800'
                    }`}
                  >
                    {track.isMuted ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>

                  {/* Smooth track */}
                  {hasData && (
                    <button
                      id={`smooth-btn-${limbId}`}
                      title="Smooth recorded motion jitter"
                      onClick={() => onSmoothTrack(limbId)}
                      className="p-1 text-neutral-400 hover:text-sky-300 hover:bg-neutral-700/60 rounded transition-colors"
                    >
                      <Sparkles className="w-3 h-3" />
                    </button>
                  )}

                  {/* Clear track */}
                  {hasData && (
                    <button
                      id={`clear-btn-${limbId}`}
                      title="Clear recorded performance for this layer"
                      onClick={() => onClearTrack(limbId)}
                      className="p-1 text-neutral-500 hover:text-rose-400 hover:bg-neutral-700/60 rounded transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Weight Slider if Selected */}
              {isSelected && (
                <div
                  className="mt-2 pt-2 border-t border-neutral-700/60 flex items-center justify-between gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                    <Sliders className="w-3 h-3" /> Layer Strength:
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.05"
                    value={track.weight}
                    onChange={(e) => onUpdateTrackWeight(limbId, parseFloat(e.target.value))}
                    className="w-24 h-1 accent-sky-500 bg-neutral-700 rounded-lg cursor-pointer"
                    title={`Layer Motion Weight: ${Math.round(track.weight * 100)}%`}
                  />
                  <span className="text-[10px] font-mono text-neutral-300 w-8 text-right">
                    {Math.round(track.weight * 100)}%
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Layer Rack Footer Actions */}
      <div className="p-2 border-t border-neutral-800 bg-neutral-950/60 flex items-center justify-between text-[11px] text-neutral-400">
        <span>Stack layers by recording 1 limb at a time</span>
      </div>
    </div>
  );
};
