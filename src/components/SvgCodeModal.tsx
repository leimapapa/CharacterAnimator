import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Code,
  Check,
  Copy,
  RotateCcw,
  Sparkles,
  AlertCircle,
  X,
  Eye,
  Sliders,
  Sun,
  Moon,
  Layers,
  FileCode,
  CheckCircle2,
} from 'lucide-react';
import { CharacterSvg } from './CharacterSvg';
import { PuppetPose, LimbPivots } from '../types';
import {
  DEFAULT_CHARACTER_SVG,
  DEATH_CHARACTER_SVG,
  ParsedCharacterSvg,
  parseCharacterSvg,
  toggleInsetShadowInSvgCode,
} from '../utils/customSvgManager';

interface SvgCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSvgCode: string;
  onApplySvgCode: (newSvgCode: string) => void;
  pose: PuppetPose;
  pivots?: LimbPivots;
}

export const SvgCodeModal: React.FC<SvgCodeModalProps> = ({
  isOpen,
  onClose,
  currentSvgCode,
  onApplySvgCode,
  pose,
  pivots,
}) => {
  const [code, setCode] = useState<string>(currentSvgCode);
  const [copied, setCopied] = useState<boolean>(false);
  const [appliedFeedback, setAppliedFeedback] = useState<boolean>(false);
  const [previewBg, setPreviewBg] = useState<'dark' | 'checkerboard' | 'white'>('dark');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Sync initial code whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setCode(currentSvgCode);
      setAppliedFeedback(false);
    }
  }, [isOpen, currentSvgCode]);

  // Live XML parsing & validation
  const validation = useMemo(() => {
    return parseCharacterSvg(code);
  }, [code]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetDefault = () => {
    if (window.confirm('Reset character SVG code back to original template with inset shadow?')) {
      setCode(DEFAULT_CHARACTER_SVG);
    }
  };

  const handleToggleInsetShadow = () => {
    const isCurrentlyActive = validation.parsed?.hasInsetShadow ?? false;
    const updated = toggleInsetShadowInSvgCode(code, !isCurrentlyActive);
    setCode(updated);
  };

  const handleApply = () => {
    if (!validation.success || !validation.parsed) {
      alert('Please fix the SVG syntax errors before applying.');
      return;
    }
    onApplySvgCode(code);
    setAppliedFeedback(true);
    setTimeout(() => {
      setAppliedFeedback(false);
      onClose();
    }, 500);
  };

  const handleQuickColorTweak = (colorHex: string, label: string) => {
    // Quick helper to replace lightblue body color with something else
    let updated = code.replace(/fill="lightblue"/gi, `fill="${colorHex}"`);
    setCode(updated);
  };

  // Line count for gutter
  const lineCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-5xl h-[92vh] flex flex-col bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-800 bg-neutral-950/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                SVG Code Editor
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300">
                  Live Rigged Vector
                </span>
              </h2>
              <p className="text-[11px] text-neutral-400">
                Edit vector paths, gradients, filters, masks, and inset shadow &lt;use&gt; elements with live canvas preview
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              title="Close editor"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-800 bg-neutral-900 text-xs flex-wrap gap-2 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Inset Shadow Toggle Action */}
            <button
              type="button"
              id="btn-svg-toggle-inset-shadow"
              onClick={handleToggleInsetShadow}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                validation.parsed?.hasInsetShadow
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:text-white'
              }`}
              title="Toggle <use href='#pig'> inset shadow mask & radial gradient overlay in code"
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {validation.parsed?.hasInsetShadow ? '✓ Inset Shadow (<use> Active)' : '+ Add Inset Shadow (<use>)'}
              </span>
            </button>

            {/* Preset Character Templates */}
            <div className="flex items-center gap-1 border-r border-neutral-800 pr-2 mr-1">
              <span className="text-[11px] text-neutral-400 font-medium mr-1 hidden sm:inline">Templates:</span>
              <button
                type="button"
                id="btn-svg-template-piggy"
                onClick={() => setCode(DEFAULT_CHARACTER_SVG)}
                className="flex items-center gap-1 px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700"
                title="Load standard Piggy SVG character template"
              >
                <span>🐷</span>
                <span>Piggy</span>
              </button>
              <button
                type="button"
                id="btn-svg-template-death"
                onClick={() => setCode(DEATH_CHARACTER_SVG)}
                className="flex items-center gap-1 px-2 py-1 rounded bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-200 text-xs font-medium border border-indigo-700/50"
                title="Load Grim Reaper / Death skeleton SVG template"
              >
                <span>💀</span>
                <span>Death</span>
              </button>
            </div>

            {/* Reset */}
            <button
              type="button"
              id="btn-svg-reset-default"
              onClick={handleResetDefault}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition-colors border border-neutral-700/60"
              title="Reset code to default template"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>

            {/* Copy */}
            <button
              type="button"
              id="btn-svg-copy-code"
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition-colors border border-neutral-700/60"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Quick Palette Tweak Pills */}
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
            <span className="hidden sm:inline">Body Color:</span>
            <button
              type="button"
              onClick={() => handleQuickColorTweak('lightblue', 'Default Blue')}
              className="w-4 h-4 rounded-full bg-sky-300 border border-neutral-600 hover:scale-110 transition-transform"
              title="Set body fill to lightblue"
            />
            <button
              type="button"
              onClick={() => handleQuickColorTweak('#f43f5e', 'Rose Red')}
              className="w-4 h-4 rounded-full bg-rose-500 border border-neutral-600 hover:scale-110 transition-transform"
              title="Set body fill to Rose"
            />
            <button
              type="button"
              onClick={() => handleQuickColorTweak('#10b981', 'Emerald')}
              className="w-4 h-4 rounded-full bg-emerald-500 border border-neutral-600 hover:scale-110 transition-transform"
              title="Set body fill to Emerald"
            />
            <button
              type="button"
              onClick={() => handleQuickColorTweak('#a855f7', 'Purple')}
              className="w-4 h-4 rounded-full bg-purple-500 border border-neutral-600 hover:scale-110 transition-transform"
              title="Set body fill to Purple"
            />
            <button
              type="button"
              onClick={() => handleQuickColorTweak('#eab308', 'Amber')}
              className="w-4 h-4 rounded-full bg-amber-500 border border-neutral-600 hover:scale-110 transition-transform"
              title="Set body fill to Amber"
            />
          </div>
        </div>

        {/* Main Editor & Live Preview Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left: Code Editor with line gutter */}
          <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-neutral-800 overflow-hidden bg-neutral-950">
            <div className="flex-1 flex overflow-hidden font-mono text-xs">
              {/* Line Numbers Gutter */}
              <div className="w-10 py-3 bg-neutral-900/60 select-none text-right pr-2.5 text-neutral-600 border-r border-neutral-800/80 shrink-0 overflow-hidden">
                {lineNumbers.map((n) => (
                  <div key={n} className="leading-5">
                    {n}
                  </div>
                ))}
              </div>

              {/* Textarea Code Input */}
              <textarea
                ref={textareaRef}
                id="svg-code-textarea"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                className="flex-1 p-3 bg-transparent text-neutral-200 resize-none focus:outline-none leading-5 font-mono selection:bg-sky-500/30 whitespace-pre overflow-auto"
                placeholder="Paste or write SVG markup here..."
              />
            </div>

            {/* Syntax Validation Status Bar */}
            <div className="px-4 py-2 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between text-xs shrink-0">
              {validation.success ? (
                <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Valid SVG XML</span>
                  <span className="text-neutral-500">•</span>
                  <span className="text-neutral-400">
                    {validation.parsed?.hasInsetShadow ? 'Inset shadow overlay enabled' : 'Inset shadow removed'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-rose-400 font-medium truncate">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="truncate">{validation.error || 'XML Syntax error'}</span>
                </div>
              )}

              <span className="text-[11px] font-mono text-neutral-500 hidden sm:inline">
                {code.length} chars • {lineCount} lines
              </span>
            </div>
          </div>

          {/* Right: Live Interactive Vector Preview */}
          <div className="w-full md:w-[360px] lg:w-[400px] flex flex-col bg-neutral-900 shrink-0">
            {/* Preview Stage Header */}
            <div className="flex items-center justify-between px-3.5 py-2 border-b border-neutral-800 bg-neutral-950/40 shrink-0">
              <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-sky-400" />
                Live Character Preview
              </span>

              {/* Preview Canvas Background Toggle */}
              <div className="flex items-center gap-1 text-[10px]">
                <button
                  type="button"
                  onClick={() => setPreviewBg('dark')}
                  className={`px-2 py-0.5 rounded border transition-colors ${
                    previewBg === 'dark' ? 'bg-sky-500/25 border-sky-400 text-sky-300 font-bold' : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                  }`}
                >
                  Dark
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewBg('checkerboard')}
                  className={`px-2 py-0.5 rounded border transition-colors ${
                    previewBg === 'checkerboard' ? 'bg-sky-500/25 border-sky-400 text-sky-300 font-bold' : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                  }`}
                >
                  Alpha
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewBg('white')}
                  className={`px-2 py-0.5 rounded border transition-colors ${
                    previewBg === 'white' ? 'bg-sky-500/25 border-sky-400 text-sky-300 font-bold' : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                  }`}
                >
                  White
                </button>
              </div>
            </div>

            {/* Preview Canvas Box */}
            <div
              className={`flex-1 flex items-center justify-center p-4 overflow-hidden ${
                previewBg === 'checkerboard'
                  ? 'bg-[linear-gradient(45deg,#262626_25%,transparent_25%),linear-gradient(-45deg,#262626_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#262626_75%),linear-gradient(-45deg,transparent_75%,#262626_75%)] bg-[size:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0px] bg-neutral-900'
                  : previewBg === 'white'
                  ? 'bg-white'
                  : 'bg-neutral-950'
              }`}
            >
              {validation.success && validation.parsed ? (
                <div className="w-[270px] h-[270px]">
                  <CharacterSvg
                    pose={pose}
                    pivots={pivots}
                    showVignette={validation.parsed.hasInsetShadow}
                    customSvg={validation.parsed}
                    idPrefix="preview_editor_"
                  />
                </div>
              ) : (
                <div className="text-center p-6 space-y-2">
                  <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
                  <p className="text-xs text-rose-400 font-semibold">Preview paused</p>
                  <p className="text-[11px] text-neutral-500">Fix XML syntax error on the left to restore live preview.</p>
                </div>
              )}
            </div>

            {/* Inset Shadow Info Box */}
            <div className="p-3.5 border-t border-neutral-800 bg-neutral-950/70 text-[11px] space-y-1.5 shrink-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-300">Inset Shadow Status:</span>
                <span
                  className={`font-mono font-semibold px-2 py-0.5 rounded text-[10px] ${
                    validation.parsed?.hasInsetShadow
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                  }`}
                >
                  {validation.parsed?.hasInsetShadow ? 'Active (Uses <use> & Mask)' : 'Removed'}
                </span>
              </div>
              <p className="text-neutral-400 text-[10px] leading-relaxed">
                The inset shadow is generated by masking a radial gradient circle with:
                <code className="block bg-neutral-900 text-amber-300 px-1.5 py-1 rounded border border-neutral-800 my-1 font-mono text-[9.5px]">
                  &lt;circle cx="150" cy="150" r="200" fill="url(#bodyGrad)" mask="url(#bodyMask)" /&gt;
                </code>
                Delete or comment out this circle tag to remove the shadow, or click the <strong>Toggle Inset Shadow</strong> button above!
              </p>
            </div>
          </div>
        </div>

        {/* Footer with Apply / Cancel */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-neutral-800 bg-neutral-950/90 shrink-0">
          <div className="text-xs text-neutral-400">
            Changes apply to timeline playback, puppet stage, and all exports (SVG/WebM/PNG).
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              id="btn-apply-svg-code"
              onClick={handleApply}
              disabled={!validation.success}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 disabled:opacity-50 transition-all shadow-md"
            >
              {appliedFeedback ? <Check className="w-4 h-4 text-emerald-300" /> : <Sparkles className="w-4 h-4" />}
              <span>{appliedFeedback ? 'Applied!' : 'Apply SVG to Character'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
