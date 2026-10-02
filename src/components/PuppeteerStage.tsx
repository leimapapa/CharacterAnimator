import React, { useRef, useState, useEffect } from 'react';
import { CharacterSvg } from './CharacterSvg';
import { DEFAULT_PIVOTS, LIMB_CONFIGS } from '../constants/defaultCharacter';
import { LimbId, LimbPivots, PuppetPose } from '../types';
import { ParsedCharacterSvg } from '../utils/customSvgManager';
import { Maximize2, Minimize2, Eye, EyeOff, RotateCcw, Crosshair, Check, Lock, Unlock, Pin } from 'lucide-react';

interface PuppeteerStageProps {
  pose: PuppetPose;
  pivots: LimbPivots;
  onPivotChange: (limbId: LimbId, pivot: { x: number; y: number }) => void;
  onResetPivot?: (limbId: LimbId) => void;
  isEditingPivot: boolean;
  onToggleEditPivot: (editing?: boolean) => void;
  selectedLimb: LimbId | null;
  onSelectLimb: (limbId: LimbId) => void;
  onPoseChange: (limbId: LimbId, partialPose: Partial<{ rotation: number; x: number; y: number; scaleX: number; scaleY: number }>) => void;
  isRecording: boolean;
  armedLimbName?: string;
  countIn: number;
  ghostPose?: PuppetPose | null;
  onResetPose?: () => void;
  customSvg?: ParsedCharacterSvg;
  unlock360Rotation?: boolean;
  onToggle360Rotation?: (unlock: boolean) => void;
  onSetStartPosition?: (limbId: LimbId) => void;
  onResetToStartPosition?: (limbId: LimbId) => void;
  startPositionFeedback?: string | null;
  activeConfigs?: Record<LimbId, any>;
  activePivots?: Record<LimbId, { x: number; y: number }>;
  characterType?: 'piggy' | 'death' | 'custom';
  onToggleCharacter?: (char: 'piggy' | 'death') => void;
}

export const PuppeteerStage: React.FC<PuppeteerStageProps> = ({
  pose,
  pivots,
  onPivotChange,
  onResetPivot,
  isEditingPivot,
  onToggleEditPivot,
  selectedLimb,
  onSelectLimb,
  onPoseChange,
  isRecording,
  armedLimbName,
  countIn,
  ghostPose,
  onResetPose,
  customSvg,
  unlock360Rotation = true,
  onToggle360Rotation,
  onSetStartPosition,
  onResetToStartPosition,
  startPositionFeedback,
  activeConfigs,
  activePivots,
  characterType = 'piggy',
  onToggleCharacter,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [bgTheme, setBgTheme] = useState<'studio' | 'draft' | 'grid' | 'meadow'>('studio');
  const [showGizmos, setShowGizmos] = useState<boolean>(true);
  const [showVignette, setShowVignette] = useState<boolean>(true);
  const [zoom, setZoom] = useState<number>(1.15);

  // Dragging state for on-stage rotation/translation/pivot
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isHandleHovered, setIsHandleHovered] = useState<boolean>(false);
  const [isPivotHovered, setIsPivotHovered] = useState<boolean>(false);
  const dragModeRef = useRef<'rotate' | 'translate' | 'pivot'>('rotate');
  const initialPointerPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const initialLimbPose = useRef<{ rotation: number; x: number; y: number }>({ rotation: 0, x: 0, y: 0 });
  const lastPointerAngle = useRef<number>(0);

  const configsMap = activeConfigs || LIMB_CONFIGS;
  const activeConfig = selectedLimb ? configsMap[selectedLimb] : null;
  const currentPivot = (selectedLimb && pivots[selectedLimb]) || (activeConfig ? activeConfig.pivot : { x: 150, y: 150 });

  // Reset hover state when selected limb changes
  useEffect(() => {
    setIsHandleHovered(false);
    setIsPivotHovered(false);
  }, [selectedLimb]);

  // Convert client pointer coordinates to SVG coordinates (0..300)
  const getSvgCoordinates = (clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 150, y: 150 };
    const rect = containerRef.current.getBoundingClientRect();
    // Center of stage is (150, 150)
    const stageWidth = 300 * zoom;
    const stageHeight = 300 * zoom;
    const offsetX = (rect.width - stageWidth) / 2;
    const offsetY = (rect.height - stageHeight) / 2;

    const x = ((clientX - rect.left - offsetX) / stageWidth) * 300;
    const y = ((clientY - rect.top - offsetY) / stageHeight) * 300;
    return { x, y };
  };

  const handlePointerDown = (
    e: React.PointerEvent,
    mode: 'rotate' | 'translate' | 'pivot' = 'rotate'
  ) => {
    if (!selectedLimb || !activeConfig) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    // If user holds Alt key on translate handle, switch to pivot mode
    const actualMode = e.altKey && mode === 'translate' ? 'pivot' : mode;

    setIsDragging(true);
    dragModeRef.current = actualMode;
    initialPointerPos.current = { x: e.clientX, y: e.clientY };
    const cur = pose[selectedLimb] || { rotation: 0, x: 0, y: 0 };
    initialLimbPose.current = {
      rotation: cur.rotation,
      x: cur.x || 0,
      y: cur.y || 0,
    };

    if (actualMode === 'rotate') {
      const svgCoord = getSvgCoordinates(e.clientX, e.clientY);
      const pivot = pivots?.[selectedLimb] ?? activeConfig.pivot;
      const currentCenterX = pivot.x + (cur.x || 0);
      const currentCenterY = pivot.y + (cur.y || 0);
      lastPointerAngle.current = Math.atan2(svgCoord.y - currentCenterY, svgCoord.x - currentCenterX) * (180 / Math.PI);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !selectedLimb || !activeConfig) return;
    e.preventDefault();

    const svgCoord = getSvgCoordinates(e.clientX, e.clientY);
    const pivot = pivots?.[selectedLimb] ?? activeConfig.pivot;
    const cur = pose[selectedLimb] || { rotation: 0, x: 0, y: 0 };

    if (dragModeRef.current === 'pivot') {
      // Reposition limb center of rotation / pivot
      const newPx = Math.round(Math.max(5, Math.min(295, svgCoord.x - (cur.x || 0))));
      const newPy = Math.round(Math.max(5, Math.min(295, svgCoord.y - (cur.y || 0))));
      onPivotChange(selectedLimb, { x: newPx, y: newPy });
    } else if (dragModeRef.current === 'rotate') {
      // Calculate delta angle smoothly to allow continuous 360° rotation without snapping
      const currentCenterX = pivot.x + (cur.x || 0);
      const currentCenterY = pivot.y + (cur.y || 0);
      const currentAngle = Math.atan2(svgCoord.y - currentCenterY, svgCoord.x - currentCenterX) * (180 / Math.PI);

      let delta = currentAngle - lastPointerAngle.current;
      while (delta > 180) delta -= 360;
      while (delta < -180) delta += 360;
      lastPointerAngle.current = currentAngle;

      let targetRot = (cur.rotation || 0) + delta;

      if (!unlock360Rotation) {
        // Locked mode: clamp to anatomical range
        const [minRot, maxRot] = activeConfig.rotationRange;
        targetRot = Math.min(maxRot, Math.max(minRot, targetRot));
      } else {
        // Unlocked mode: full continuous 360° arc without snapping
        targetRot = Math.round(targetRot * 10) / 10;
      }

      onPoseChange(selectedLimb, { rotation: targetRot });
    } else {
      // Translate mode (moving body part up, down, left, right)
      const dx = (e.clientX - initialPointerPos.current.x) / zoom;
      const dy = (e.clientY - initialPointerPos.current.y) / zoom;
      
      // Extended translation limits so user can move body part anywhere on the stage
      const minX = -150;
      const maxX = 150;
      const minY = -150;
      const maxY = 150;

      const newX = Math.min(maxX, Math.max(minX, initialLimbPose.current.x + dx));
      const newY = Math.min(maxY, Math.max(minY, initialLimbPose.current.y + dy));

      onPoseChange(selectedLimb, { x: Math.round(newX), y: Math.round(newY) });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // Keyboard nudge controls when limb is selected
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedLimb || !activeConfig) return;
      if (['input', 'textarea'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) return;

      const step = e.shiftKey ? 5 : 1;
      const cur = pose[selectedLimb] || { rotation: 0, x: 0, y: 0 };

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const next = Math.max(activeConfig.rotationRange[0], cur.rotation - step);
        onPoseChange(selectedLimb, { rotation: next });
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const next = Math.min(activeConfig.rotationRange[1], cur.rotation + step);
        onPoseChange(selectedLimb, { rotation: next });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const next = Math.max(activeConfig.yRange[0], (cur.y || 0) - step);
        onPoseChange(selectedLimb, { y: next });
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = Math.min(activeConfig.yRange[1], (cur.y || 0) + step);
        onPoseChange(selectedLimb, { y: next });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLimb, activeConfig, pose, onPoseChange]);

  const bgClasses = {
    studio: 'bg-neutral-900 border-neutral-800',
    draft: 'bg-slate-100 border-slate-300 text-slate-900',
    grid: 'bg-neutral-950 border-neutral-800 [background-image:radial-gradient(#333_1px,transparent_1px)] [background-size:16px_16px]',
    meadow: 'bg-gradient-to-b from-sky-200 via-sky-100 to-emerald-100 border-sky-300',
  };

  return (
    <div
      ref={containerRef}
      id="puppeteer-stage-container"
      className={`relative w-full h-full flex items-center justify-center overflow-hidden select-none border rounded-xl transition-colors duration-200 ${bgClasses[bgTheme]}`}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={() => {
        // click outside limbs clears or maintains
      }}
    >
      {/* Top Floating Stage Controls */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-none">
        {/* Left: Active Selection & Record pill */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {selectedLimb && activeConfig ? (
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-md border shadow-sm"
              style={{
                backgroundColor: `${activeConfig.color}22`,
                borderColor: activeConfig.color,
                color: activeConfig.color,
              }}
            >
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: activeConfig.color }}
              />
              <span>Selected: {activeConfig.name}</span>
              <span className="opacity-70 font-mono text-[11px]">
                {Math.round(pose[selectedLimb]?.rotation || 0)}°
              </span>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-lg text-xs font-medium bg-black/40 text-neutral-300 backdrop-blur-md border border-white/10">
              Click any limb to puppeteer
            </div>
          )}

          {isRecording && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 backdrop-blur-md shadow-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span>REC: {armedLimbName || 'Performance'}</span>
            </div>
          )}
        </div>

        {/* Right: Stage View & Display Controls */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-black/50 text-neutral-300 backdrop-blur-md border border-white/10 pointer-events-auto">
          {/* Zoom controls */}
          <button
            id="stage-zoom-out-btn"
            onClick={() => setZoom((z) => Math.max(0.7, z - 0.15))}
            className="px-2 py-1 text-xs hover:text-white hover:bg-white/10 rounded transition-colors"
            title="Zoom Out"
          >
            -
          </button>
          <span className="text-[11px] font-mono px-1 opacity-75">{Math.round(zoom * 100)}%</span>
          <button
            id="stage-zoom-in-btn"
            onClick={() => setZoom((z) => Math.min(2.2, z + 0.15))}
            className="px-2 py-1 text-xs hover:text-white hover:bg-white/10 rounded transition-colors"
            title="Zoom In"
          >
            +
          </button>

          <div className="w-px h-3.5 bg-white/20 mx-1" />

          {/* Background Switcher */}
          <button
            id="stage-bg-toggle-btn"
            onClick={() => {
              const themes: Array<'studio' | 'draft' | 'grid' | 'meadow'> = ['studio', 'grid', 'draft', 'meadow'];
              const next = themes[(themes.indexOf(bgTheme) + 1) % themes.length];
              setBgTheme(next);
            }}
            className="px-2 py-1 text-xs hover:text-white hover:bg-white/10 rounded capitalize transition-colors"
            title="Switch Background Theme"
          >
            {bgTheme}
          </button>

          {/* Character Quick Toggle */}
          {onToggleCharacter && (
            <div className="flex items-center p-0.5 bg-neutral-900/90 border border-neutral-700/80 rounded-lg text-xs gap-0.5">
              <button
                id="stage-btn-char-piggy"
                onClick={() => onToggleCharacter('piggy')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 transition-all ${
                  characterType === 'piggy'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white hover:bg-white/10'
                }`}
                title="Switch to Piggy Character with Piggy Rigging"
              >
                <span>🐷</span>
                <span className="hidden sm:inline">Piggy</span>
              </button>
              <button
                id="stage-btn-char-death"
                onClick={() => onToggleCharacter('death')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 transition-all ${
                  characterType === 'death'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white hover:bg-white/10'
                }`}
                title="Switch to Death (Grim Reaper) with Skeleton Rigging"
              >
                <span>💀</span>
                <span className="hidden sm:inline">Death</span>
              </button>
            </div>
          )}

          {/* Gizmo toggle */}
          <button
            id="stage-gizmo-toggle-btn"
            onClick={() => setShowGizmos((g) => !g)}
            className={`p-1 text-xs rounded transition-colors ${showGizmos ? 'text-sky-400 bg-sky-400/20' : 'text-neutral-400 hover:text-white'}`}
            title="Toggle On-Screen Gizmo Handles"
          >
            {showGizmos ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>

          {/* Center (Pivot) Adjust Mode Toggle */}
          {selectedLimb && (
            <button
              id="stage-pivot-toggle-btn"
              onClick={() => onToggleEditPivot(!isEditingPivot)}
              className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                isEditingPivot
                  ? 'text-amber-300 bg-amber-500/25 border border-amber-500/50 font-bold shadow-sm'
                  : 'text-neutral-300 hover:text-white hover:bg-white/10'
              }`}
              title={isEditingPivot ? 'Exit Center Adjust Mode' : 'Move Center of Rotation / Pivot'}
            >
              <Crosshair className={`w-3.5 h-3.5 text-amber-400 ${isEditingPivot ? 'animate-spin' : ''}`} />
              <span>Center</span>
            </button>
          )}

          {/* 360 Degree Rotation Arc Unlock Toggle */}
          {onToggle360Rotation && (
            <button
              id="stage-toggle-360-rotation-btn"
              onClick={() => onToggle360Rotation(!unlock360Rotation)}
              className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                unlock360Rotation
                  ? 'text-sky-300 bg-sky-500/25 border border-sky-500/50 font-bold shadow-sm'
                  : 'text-neutral-400 hover:text-white hover:bg-white/10'
              }`}
              title={
                unlock360Rotation
                  ? '360° Rotation Arc Unlocked: Rotate around center point in full 360° continuous spin without snapping'
                  : 'Rotation Range Locked: Constrained to normal angle range. Click to unlock 360° arc'
              }
            >
              {unlock360Rotation ? (
                <Unlock className="w-3.5 h-3.5 text-sky-400" />
              ) : (
                <Lock className="w-3.5 h-3.5" />
              )}
              <span>{unlock360Rotation ? '360° Arc' : 'Locked Arc'}</span>
            </button>
          )}

          {/* Set Initial Start Position Button */}
          {onSetStartPosition && selectedLimb && (
            <button
              id="stage-set-start-pose-btn"
              onClick={() => onSetStartPosition(selectedLimb)}
              className="flex items-center gap-1 px-2 py-1 text-xs rounded text-emerald-300 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 transition-colors font-medium shadow-sm"
              title="Save current position & rotation as starting pose for recording"
            >
              <Pin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Set Start Pose</span>
            </button>
          )}

          {/* Reset pose */}
          {onResetPose && (
            <button
              id="stage-reset-pose-btn"
              onClick={onResetPose}
              className="p-1 text-xs text-neutral-400 hover:text-white hover:bg-white/10 rounded transition-colors"
              title="Reset Character to Rest Pose"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Start Position Saved Feedback Toast */}
      {startPositionFeedback && (
        <div className="absolute top-14 inset-x-0 z-40 flex justify-center pointer-events-none animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/95 border border-emerald-500/60 shadow-xl shadow-emerald-950/50 backdrop-blur-md">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-200">{startPositionFeedback}</span>
          </div>
        </div>
      )}

      {/* Top HUD Banner when Adjusting Center of Motion */}
      {isEditingPivot && selectedLimb && activeConfig && (
        <div className="absolute top-14 inset-x-4 z-40 flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/95 border border-amber-500/50 shadow-2xl backdrop-blur-md animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <Crosshair className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">
                Adjusting Center of Motion: <span style={{ color: activeConfig.color }}>{activeConfig.name}</span>
              </p>
              <p className="text-[11px] text-neutral-400">
                Drag crosshair or click on canvas to reposition rotation center • ({Math.round(currentPivot.x)}, {Math.round(currentPivot.y)})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onResetPivot && (
              <button
                id="stage-banner-reset-pivot-btn"
                onClick={() => onResetPivot(selectedLimb)}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors"
              >
                Reset Default
              </button>
            )}
            <button
              id="stage-banner-done-pivot-btn"
              onClick={() => onToggleEditPivot(false)}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-black shadow-md transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              Done
            </button>
          </div>
        </div>
      )}

      {/* 3-2-1 Non-Obstructive Countdown Banner (Top of Stage, No Canvas Darkening or Blurring) */}
      {countIn > 0 && (
        <div className="absolute top-3 inset-x-0 z-40 flex justify-center pointer-events-none animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-neutral-900/95 border-2 border-rose-500 shadow-2xl shadow-rose-950/80 backdrop-blur-sm">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-rose-600 text-white font-black text-lg shadow-inner animate-pulse">
              {countIn}
            </span>
            <div className="text-left pr-1">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                RECORDING IN {countIn}...
              </div>
              <div className="text-[11px] text-rose-300">
                Position your cursor ready on <strong className="text-white underline">{armedLimbName || 'Armed Layer'}</strong>!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SVG Canvas Area */}
      <div
        className="relative transition-transform duration-75 ease-out"
        style={{
          width: `${300 * zoom}px`,
          height: `${300 * zoom}px`,
        }}
      >
        <CharacterSvg
          pose={pose}
          pivots={pivots}
          ghostPose={ghostPose}
          selectedLimb={selectedLimb}
          onSelectLimb={onSelectLimb}
          interactive={!isEditingPivot}
          showVignette={showVignette}
          idPrefix="stage_"
          className="w-full h-full drop-shadow-2xl"
          customSvg={customSvg}
        />

        {/* On-Stage Interactive Puppeteer Gizmo / Center of Motion Reticle */}
        {showGizmos && selectedLimb && activeConfig && (
          <svg
            viewBox="0 0 300 300"
            className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-30"
          >
            {(() => {
              const pivot = pivots?.[selectedLimb] ?? activeConfig.pivot;
              const curLimb = pose[selectedLimb] || { rotation: 0, x: 0, y: 0 };
              const currentX = pivot.x + (curLimb.x || 0);
              const currentY = pivot.y + (curLimb.y || 0);
              const radius = 38;
              const angleRad = (curLimb.rotation * Math.PI) / 180;
              const handleX = currentX + Math.cos(angleRad) * radius;
              const handleY = currentY + Math.sin(angleRad) * radius;

              if (isEditingPivot) {
                return (
                  <g className="cursor-crosshair">
                    {/* Full Canvas Click & Drag Area to Reposition Pivot */}
                    <rect
                      x="0"
                      y="0"
                      width="300"
                      height="300"
                      fill="transparent"
                      className="cursor-crosshair pointer-events-auto"
                      onPointerDown={(e) => {
                        handlePointerDown(e, 'pivot');
                        const coord = getSvgCoordinates(e.clientX, e.clientY);
                        const newPx = Math.round(Math.max(5, Math.min(295, coord.x - (curLimb.x || 0))));
                        const newPy = Math.round(Math.max(5, Math.min(295, coord.y - (curLimb.y || 0))));
                        onPivotChange(selectedLimb, { x: newPx, y: newPy });
                      }}
                    />

                    {/* Stage-Wide Alignment Guidelines */}
                    <line
                      x1="0"
                      y1={currentY}
                      x2="300"
                      y2={currentY}
                      stroke="#f59e0b"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                      opacity="0.6"
                      className="pointer-events-none"
                    />
                    <line
                      x1={currentX}
                      y1="0"
                      x2={currentX}
                      y2="300"
                      stroke="#f59e0b"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                      opacity="0.6"
                      className="pointer-events-none"
                    />

                    {/* Center of Motion Reticle Anchor */}
                    <g
                      transform={`translate(${currentX}, ${currentY})`}
                      className="pointer-events-auto cursor-move select-none"
                      onPointerDown={(e) => handlePointerDown(e, 'pivot')}
                    >
                      {/* Invisible Drag Catch Area */}
                      <circle r="26" fill="transparent" />

                      {/* Pulsing Outer Range Ring */}
                      <circle
                        r="22"
                        fill="#f59e0b"
                        fillOpacity="0.12"
                        stroke="#f59e0b"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                        className="animate-pulse"
                      />

                      {/* Reticle Inner Circle */}
                      <circle
                        r="14"
                        fill="#171717"
                        stroke="#f59e0b"
                        strokeWidth="2"
                        filter="drop-shadow(0 2px 4px rgba(0,0,0,0.6))"
                      />

                      {/* 4 Crosshair Axis Ticks */}
                      <line x1="-18" y1="0" x2="-7" y2="0" stroke="#f59e0b" strokeWidth="2" />
                      <line x1="7" y1="0" x2="18" y2="0" stroke="#f59e0b" strokeWidth="2" />
                      <line x1="0" y1="-18" x2="0" y2="-7" stroke="#f59e0b" strokeWidth="2" />
                      <line x1="0" y1="7" x2="0" y2="18" stroke="#f59e0b" strokeWidth="2" />

                      {/* Reticle Center Jewel */}
                      <circle r="3.5" fill="#ffffff" stroke="#f59e0b" strokeWidth="1.5" />

                      {/* Coordinates Floating Badge */}
                      <g transform="translate(0, -28)" className="pointer-events-none">
                        <rect
                          x="-45"
                          y="-10"
                          width="90"
                          height="18"
                          rx="4"
                          fill="#171717"
                          fillOpacity="0.9"
                          stroke="#f59e0b"
                          strokeWidth="1"
                        />
                        <text
                          x="0"
                          y="3"
                          textAnchor="middle"
                          fill="#fbbf24"
                          fontSize="10"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          X:{Math.round(pivot.x)} Y:{Math.round(pivot.y)}
                        </text>
                      </g>
                    </g>
                  </g>
                );
              }

              return (
                <g className="cursor-grab active:cursor-grabbing">
                  {/* Outer Rotation Ring */}
                  <circle
                    cx={currentX}
                    cy={currentY}
                    r={radius}
                    fill="none"
                    stroke={activeConfig.color}
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    opacity="0.8"
                  />

                  {/* Pivot Anchor Dot (Translate Handle / Alt-Drag to Move Center) */}
                  <g
                    transform={`translate(${currentX}, ${currentY})`}
                    className="pointer-events-auto cursor-move select-none"
                    onPointerDown={(e) => handlePointerDown(e, 'translate')}
                    onPointerEnter={() => setIsPivotHovered(true)}
                    onPointerLeave={() => setIsPivotHovered(false)}
                  >
                    {/* Generous invisible hit-target to prevent missing small dot */}
                    <circle r="14" fill="transparent" />

                    {/* Scale group centered strictly at local origin (0, 0) */}
                    <g
                      className="pointer-events-none transition-transform duration-150 ease-out"
                      style={{
                        transform:
                          isPivotHovered || (isDragging && dragModeRef.current === 'translate')
                            ? 'scale(1.3)'
                            : 'scale(1)',
                        transformOrigin: '0 0',
                      }}
                    >
                      <circle
                        r="9"
                        fill={activeConfig.color}
                        opacity={
                          isPivotHovered || (isDragging && dragModeRef.current === 'translate')
                            ? 0.35
                            : 0
                        }
                        className="transition-opacity duration-150"
                      />
                      <circle
                        r="4.5"
                        fill={activeConfig.color}
                        stroke="#ffffff"
                        strokeWidth="1.5"
                        filter="drop-shadow(0 1px 2px rgba(0,0,0,0.4))"
                      />
                    </g>
                  </g>

                  {/* Aim Line to Rotation Handle */}
                  <line
                    x1={currentX}
                    y1={currentY}
                    x2={handleX}
                    y2={handleY}
                    stroke={activeConfig.color}
                    strokeWidth="2"
                    opacity="0.9"
                  />

                  {/* Interactive Rotation Knob with In-Place Centered Origin Scaling */}
                  <g
                    transform={`translate(${handleX}, ${handleY})`}
                    className="pointer-events-auto cursor-grab active:cursor-grabbing select-none"
                    onPointerDown={(e) => handlePointerDown(e, 'rotate')}
                    onPointerEnter={() => setIsHandleHovered(true)}
                    onPointerLeave={() => setIsHandleHovered(false)}
                  >
                    {/* Generous invisible hit target so pointer capture and hover never slip off */}
                    <circle r="18" fill="transparent" />

                    {/* Visual knob group: scales strictly around local origin (0, 0) */}
                    <g
                      className="pointer-events-none transition-transform duration-150 ease-out"
                      style={{
                        transform:
                          isHandleHovered || (isDragging && dragModeRef.current === 'rotate')
                            ? 'scale(1.25)'
                            : 'scale(1)',
                        transformOrigin: '0 0',
                      }}
                    >
                      {/* Glow halo when hovered or dragged */}
                      <circle
                        r="13"
                        fill={activeConfig.color}
                        opacity={
                          isHandleHovered || (isDragging && dragModeRef.current === 'rotate')
                            ? 0.35
                            : 0
                        }
                        className="transition-opacity duration-150"
                      />

                      {/* Rotation Knob Outer Circle */}
                      <circle
                        r="8"
                        fill="#ffffff"
                        stroke={activeConfig.color}
                        strokeWidth="2.5"
                        filter="drop-shadow(0 1px 3px rgba(0,0,0,0.4))"
                      />

                      {/* Knob Center Accent Dot */}
                      <circle r="2.5" fill={activeConfig.color} />
                    </g>
                  </g>

                  {/* Angle readout pill */}
                  <text
                    x={handleX + (Math.cos(angleRad) >= 0 ? 16 : -16)}
                    y={handleY + 4}
                    textAnchor={Math.cos(angleRad) >= 0 ? 'start' : 'end'}
                    fill="#ffffff"
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="bold"
                    filter="drop-shadow(0 1px 2px rgba(0,0,0,0.9))"
                    className="pointer-events-none select-none"
                  >
                    {Math.round(curLimb.rotation)}°
                  </text>
                </g>
              );
            })()}
          </svg>
        )}
      </div>

      {/* Subtle Hint Bar at Bottom of Stage */}
      <div className="absolute bottom-2 inset-x-0 flex justify-center pointer-events-none">
        <span className="text-[11px] px-2.5 py-1 rounded-full bg-black/40 text-neutral-400 backdrop-blur-sm border border-white/5">
          {selectedLimb
            ? 'Drag rotation handle to puppeteer • Arrow Keys to nudge • Hold Shift for fast step'
            : 'Click any body part on the pig to begin puppeteering'}
        </span>
      </div>
    </div>
  );
};
