import React, { useRef, useState, useEffect } from 'react';
import { LIMB_CONFIGS, LIMB_ORDER } from '../constants/defaultCharacter';
import { LayerTrack, LimbId, TimelineState } from '../types';
import {
  Circle,
  Clock,
  FastForward,
  Pause,
  Play,
  Repeat,
  Rewind,
  Square,
  Timer,
} from 'lucide-react';

interface TimelineProps {
  timeline: TimelineState;
  tracks: Record<LimbId, LayerTrack>;
  selectedLimb: LimbId | null;
  onSelectLimb: (limbId: LimbId) => void;
  onTogglePlay: () => void;
  onToggleRecord: () => void;
  onStop: () => void;
  onSeek: (time: number) => void;
  onToggleLoop: () => void;
  onSetDuration: (duration: number) => void;
  onSetFps: (fps: number) => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  timeline,
  tracks,
  selectedLimb,
  onSelectLimb,
  onTogglePlay,
  onToggleRecord,
  onStop,
  onSeek,
  onToggleLoop,
  onSetDuration,
  onSetFps,
}) => {
  const rulerRef = useRef<HTMLDivElement | null>(null);
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);
  const [customDurationStr, setCustomDurationStr] = useState<string>(timeline.duration.toFixed(1));

  useEffect(() => {
    setCustomDurationStr(timeline.duration.toFixed(1));
  }, [timeline.duration]);

  const duration = timeline.duration;
  const progressPercent = Math.min(100, Math.max(0, (timeline.currentTime / duration) * 100));
  const currentFrame = Math.floor(timeline.currentTime * timeline.fps);
  const totalFrames = Math.floor(duration * timeline.fps);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!rulerRef.current) return;
    setIsScrubbing(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    seekFromPointer(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isScrubbing) return;
    seekFromPointer(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isScrubbing) {
      setIsScrubbing(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  const seekFromPointer = (clientX: number) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const targetTime = (x / rect.width) * duration;
    onSeek(targetTime);
  };

  // Generate ruler tick marks
  const numSeconds = Math.ceil(duration);
  const ticks = [];
  for (let s = 0; s <= numSeconds; s++) {
    ticks.push(s);
  }

  const armedCount = (Object.values(tracks) as LayerTrack[]).filter((t) => t.isArmed).length;

  return (
    <div
      id="puppeteer-timeline"
      className="flex flex-col bg-neutral-900/95 border border-neutral-800 rounded-xl overflow-hidden backdrop-blur-md select-none shadow-lg"
    >
      {/* Top Transport Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2 border-b border-neutral-800 bg-neutral-950/60">
        {/* Left: Transport Buttons */}
        <div className="flex items-center gap-1.5">
          {/* Rewind */}
          <button
            id="btn-timeline-rewind"
            onClick={() => onSeek(0)}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
            title="Rewind to Start (0s)"
          >
            <Rewind className="w-4 h-4" />
          </button>

          {/* Play/Pause */}
          <button
            id="btn-timeline-play"
            onClick={onTogglePlay}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors shadow-sm ${
              timeline.isPlaying && !timeline.isRecording
                ? 'bg-amber-500 hover:bg-amber-400 text-black'
                : 'bg-neutral-800 hover:bg-neutral-700 text-white'
            }`}
            title="Play / Pause (Spacebar)"
          >
            {timeline.isPlaying && !timeline.isRecording ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" /> Pause
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> Play
              </>
            )}
          </button>

          {/* Record Button */}
          <button
            id="btn-timeline-record"
            onClick={onToggleRecord}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all shadow-sm ${
              timeline.isRecording
                ? 'bg-rose-600 text-white ring-2 ring-rose-400 animate-pulse'
                : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40'
            }`}
            title={`Record Motion Layer (${armedCount} limb${armedCount !== 1 ? 's' : ''} armed)`}
          >
            <Circle className={`w-3.5 h-3.5 ${timeline.isRecording ? 'fill-current' : 'fill-rose-500'}`} />
            {timeline.isRecording ? 'Recording Pass...' : 'Record Layer'}
          </button>

          {/* Stop */}
          <button
            id="btn-timeline-stop"
            onClick={onStop}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
            title="Stop Playback"
          >
            <Square className="w-4 h-4 fill-current" />
          </button>

          {/* Loop toggle */}
          <button
            id="btn-timeline-loop"
            onClick={onToggleLoop}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
              timeline.isLooping
                ? 'bg-sky-600/30 text-sky-400 border border-sky-500/40'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200'
            }`}
            title={timeline.isLooping ? 'Loop Enabled' : 'Loop Disabled'}
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        {/* Middle: Timecode & Frame Counter */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800">
            <Clock className="w-3.5 h-3.5 text-neutral-500" />
            <span className="text-white font-bold">
              {timeline.currentTime.toFixed(2)}s
            </span>
            <span className="text-neutral-500">/ {duration.toFixed(2)}s</span>
          </div>

          <div className="px-2 py-1 rounded bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-400">
            Frame <span className="text-sky-400 font-bold">{currentFrame}</span> / {totalFrames}
          </div>
        </div>

        {/* Right: Duration & FPS Selectors */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-neutral-400">
            <Timer className="w-3.5 h-3.5" />
            <span>Duration:</span>
            <select
              id="select-timeline-duration"
              value={['2.0', '3.0', '4.0', '5.0', '8.0', '10.0'].includes(duration.toFixed(1)) ? duration.toFixed(1) : 'custom'}
              onChange={(e) => {
                if (e.target.value !== 'custom') {
                  const val = parseFloat(e.target.value);
                  setCustomDurationStr(val.toFixed(1));
                  onSetDuration(val);
                }
              }}
              className="bg-neutral-800 border border-neutral-700 rounded px-1.5 py-0.5 text-neutral-200 font-mono focus:outline-none"
            >
              <option value="2.0">2.0s</option>
              <option value="3.0">3.0s</option>
              <option value="4.0">4.0s</option>
              <option value="5.0">5.0s</option>
              <option value="8.0">8.0s</option>
              <option value="10.0">10.0s</option>
              <option value="custom">Custom...</option>
            </select>
            <div className="flex items-center gap-0.5">
              <input
                type="number"
                id="input-timeline-custom-duration"
                step="0.1"
                min="0.5"
                max="60.0"
                value={customDurationStr}
                onChange={(e) => {
                  setCustomDurationStr(e.target.value);
                  const parsed = parseFloat(e.target.value);
                  if (!isNaN(parsed) && parsed >= 0.5 && parsed <= 60.0) {
                    const rounded = Math.round(parsed * 10) / 10;
                    onSetDuration(rounded);
                  }
                }}
                onBlur={() => {
                  let parsed = parseFloat(customDurationStr);
                  if (isNaN(parsed) || parsed < 0.5) parsed = 4.0;
                  if (parsed > 60.0) parsed = 60.0;
                  const rounded = Math.round(parsed * 10) / 10;
                  setCustomDurationStr(rounded.toFixed(1));
                  onSetDuration(rounded);
                }}
                className="w-14 bg-neutral-900 border border-neutral-700 hover:border-sky-500 focus:border-sky-400 text-sky-300 font-mono text-[11px] text-center rounded px-1 py-0.5 focus:outline-none font-bold"
                title="Type exact clip length with 0.1s accuracy"
              />
              <span className="text-[11px] text-neutral-400 font-mono">s</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-neutral-400">
            <span>FPS:</span>
            <select
              id="select-timeline-fps"
              value={timeline.fps}
              onChange={(e) => onSetFps(parseInt(e.target.value, 10))}
              className="bg-neutral-800 border border-neutral-700 rounded px-1.5 py-0.5 text-neutral-200 font-mono focus:outline-none"
            >
              <option value="30">30</option>
              <option value="60">60</option>
            </select>
          </div>
        </div>
      </div>

      {/* Multi-Track Lanes & Scrubber */}
      <div className="relative p-3 bg-neutral-950/40">
        {/* Scrubber Ruler Header */}
        <div
          ref={rulerRef}
          id="timeline-ruler"
          className="relative h-6 bg-neutral-900 border border-neutral-800 rounded-t-md cursor-pointer select-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* Tick markers */}
          {ticks.map((sec) => {
            const leftPercent = (sec / duration) * 100;
            return (
              <div
                key={sec}
                className="absolute top-0 bottom-0 flex flex-col justify-between -translate-x-1/2 pointer-events-none"
                style={{ left: `${leftPercent}%` }}
              >
                <span className="text-[9px] font-mono text-neutral-500 select-none">
                  {sec}s
                </span>
                <div className="w-px h-2 bg-neutral-700 mx-auto" />
              </div>
            );
          })}

          {/* Sub-ticks (half-seconds) */}
          {ticks.slice(0, -1).map((sec) => {
            const leftPercent = ((sec + 0.5) / duration) * 100;
            return (
              <div
                key={`sub_${sec}`}
                className="absolute bottom-0 -translate-x-1/2 pointer-events-none"
                style={{ left: `${leftPercent}%` }}
              >
                <div className="w-px h-1.5 bg-neutral-800" />
              </div>
            );
          })}

          {/* Playhead Marker on Ruler */}
          <div
            className="absolute top-0 bottom-0 w-3 -ml-1.5 z-30 pointer-events-none flex justify-center"
            style={{ left: `${progressPercent}%` }}
          >
            <div className="w-2.5 h-3 bg-rose-500 rounded-b-sm shadow-md" />
          </div>
        </div>

        {/* Stacked Lanes for Body Parts */}
        <div
          className="relative divide-y divide-neutral-900 border-x border-b border-neutral-800 bg-neutral-900/60 rounded-b-md overflow-hidden max-h-36 overflow-y-auto scrollbar-thin"
          onClick={(e) => {
            if (rulerRef.current) {
              const rect = rulerRef.current.getBoundingClientRect();
              const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
              onSeek((x / rect.width) * duration);
            }
          }}
        >
          {LIMB_ORDER.map((limbId) => {
            const config = LIMB_CONFIGS[limbId];
            const track = tracks[limbId];
            const isSelected = selectedLimb === limbId;
            const hasData = track.keyframes.length > 0;

            return (
              <div
                key={limbId}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectLimb(limbId);
                }}
                className={`relative h-5 flex items-center px-2 cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-neutral-800/80 font-semibold'
                    : 'hover:bg-neutral-800/40'
                }`}
              >
                {/* Track Label on the left */}
                <div className="w-20 shrink-0 flex items-center gap-1.5 z-10 text-[10px] truncate">
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: config.color }}
                  />
                  <span
                    className={`truncate ${
                      track.isArmed ? 'text-rose-400 font-bold' : isSelected ? 'text-white' : 'text-neutral-400'
                    }`}
                  >
                    {config.name}
                  </span>
                </div>

                {/* Keyframe Visual Lane */}
                <div className="relative flex-1 h-full">
                  {hasData ? (
                    <div className="absolute inset-y-1 inset-x-0 rounded bg-neutral-950/70 border border-neutral-800/80 overflow-hidden">
                      {/* Density Heatmap */}
                      {track.keyframes.map((kf, i) => {
                        const left = (kf.time / duration) * 100;
                        if (left > 100) return null;
                        return (
                          <div
                            key={i}
                            className="absolute top-0 bottom-0 w-1 -ml-0.5 rounded-full opacity-70"
                            style={{
                              left: `${left}%`,
                              backgroundColor: config.color,
                            }}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-px bg-neutral-800/40 w-full mt-2" />
                  )}
                </div>
              </div>
            );
          })}

          {/* Continuous Red Playhead Vertical Needle */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-20 pointer-events-none shadow-[0_0_8px_rgba(244,63,94,0.8)]"
            style={{ left: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
