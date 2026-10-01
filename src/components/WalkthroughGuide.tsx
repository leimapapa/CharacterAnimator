import React from 'react';
import { LimbId } from '../types';
import { LIMB_CONFIGS, LIMB_ORDER } from '../constants/defaultCharacter';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Layers,
  Play,
  Radio,
  RotateCcw,
  Sliders,
  Sparkles,
  X,
} from 'lucide-react';

export type WalkthroughStep =
  | 'move_hand'
  | 'record_hand'
  | 'record_foot'
  | 'completed';

interface WalkthroughGuideProps {
  currentStep: WalkthroughStep;
  primaryLimb?: LimbId;
  onSelectPrimaryLimb?: (limbId: LimbId) => void;
  secondaryLimb?: LimbId;
  onSelectSecondaryLimb?: (limbId: LimbId) => void;
  duration?: number;
  onChangeDuration?: (duration: number) => void;
  handMoved: boolean;
  handKeyframeCount: number;
  footKeyframeCount: number;
  isRecording: boolean;
  isPlaying: boolean;
  countIn: number;
  selectedLimb: LimbId | null;
  onSelectLimb: (limbId: LimbId) => void;
  onStartRecord: () => void;
  onTogglePlay: () => void;
  onNextStep: () => void;
  onPrevStep?: () => void;
  onRestart: () => void;
  onDismiss: () => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const WalkthroughGuide: React.FC<WalkthroughGuideProps> = ({
  currentStep,
  primaryLimb = 'handR',
  onSelectPrimaryLimb,
  secondaryLimb = 'footR',
  onSelectSecondaryLimb,
  duration = 4.0,
  onChangeDuration,
  handMoved,
  handKeyframeCount,
  footKeyframeCount,
  isRecording,
  isPlaying,
  countIn,
  selectedLimb,
  onSelectLimb,
  onStartRecord,
  onTogglePlay,
  onNextStep,
  onRestart,
  onDismiss,
  isOpen,
  onToggleOpen,
}) => {
  const [customInputVal, setCustomInputVal] = React.useState<string>(duration.toFixed(1));

  React.useEffect(() => {
    setCustomInputVal(duration.toFixed(1));
  }, [duration]);

  const primaryConfig = LIMB_CONFIGS[primaryLimb] || LIMB_CONFIGS.handR;
  const secondaryConfig = LIMB_CONFIGS[secondaryLimb] || LIMB_CONFIGS.footR;

  if (!isOpen) {
    return (
      <button
        id="btn-reopen-walkthrough"
        onClick={onToggleOpen}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg transition-all border border-rose-400/40 animate-pulse"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Resume Guided Walkthrough</span>
      </button>
    );
  }

  return (
    <div
      id="walkthrough-guide-banner"
      className="relative z-30 w-full rounded-xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 border border-neutral-700 shadow-xl overflow-hidden backdrop-blur-md"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-neutral-800 bg-neutral-950/50">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-rose-500 text-[11px] font-bold text-white">
            {currentStep === 'move_hand'
              ? '1'
              : currentStep === 'record_hand'
              ? '2'
              : currentStep === 'record_foot'
              ? '3'
              : '✓'}
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-200">
            Guided Tutorial: Custom Stacking
          </span>
          <span className="text-[11px] text-neutral-400 hidden sm:inline">
            • Step {currentStep === 'move_hand' ? '1/3' : currentStep === 'record_hand' ? '2/3' : currentStep === 'record_foot' ? '3/3' : 'Complete'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onRestart}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
            title="Restart tutorial"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden md:inline">Restart</span>
          </button>
          <button
            onClick={onToggleOpen}
            className="p-1 rounded text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
            title="Minimize"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDismiss}
            className="p-1 rounded text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
            title="Dismiss walkthrough"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main step content */}
      <div className="p-3.5">
        {/* Step 1: Configure Length, Pick Limbs & Test Move */}
        {currentStep === 'move_hand' && (
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
            <div className="flex-1 flex items-start gap-3">
              <div
                className="p-2.5 rounded-lg border text-white shrink-0 mt-0.5"
                style={{ backgroundColor: `${primaryConfig.color}20`, borderColor: `${primaryConfig.color}60` }}
              >
                <Sliders className="w-5 h-5" style={{ color: primaryConfig.color }} />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5 flex-wrap">
                  Step 1: Choose Clip Length &amp; Body Parts
                  {handMoved && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> {primaryConfig.name} Moved!
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-neutral-300 mt-0.5">
                  Select your sequence duration and which limbs you want to puppeteer. Then drag the rotation ring on the pig's{' '}
                  <strong style={{ color: primaryConfig.color }}>{primaryConfig.name}</strong> to test responsiveness!
                </p>

                {/* Duration & Limb Customization Selectors */}
                <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                  {/* Clip Duration */}
                  <div className="flex items-center gap-1.5 bg-neutral-950/90 px-2.5 py-1 rounded-lg border border-neutral-800 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-sky-400" />
                    <span className="text-neutral-400 font-medium">Clip Duration:</span>
                    <select
                      id="walkthrough-duration-select"
                      value={['2.0', '3.0', '4.0', '5.0', '6.0', '8.0', '10.0'].includes(duration.toFixed(1)) ? duration.toFixed(1) : 'custom'}
                      onChange={(e) => {
                        if (e.target.value !== 'custom') {
                          const val = parseFloat(e.target.value);
                          setCustomInputVal(val.toFixed(1));
                          onChangeDuration && onChangeDuration(val);
                        }
                      }}
                      className="bg-neutral-900 border border-neutral-700 text-white font-mono text-[11px] rounded px-2 py-0.5 focus:outline-none focus:border-sky-500"
                    >
                      <option value="2.0">2.0s</option>
                      <option value="3.0">3.0s</option>
                      <option value="4.0">4.0s (Default)</option>
                      <option value="5.0">5.0s</option>
                      <option value="6.0">6.0s</option>
                      <option value="8.0">8.0s</option>
                      <option value="10.0">10.0s</option>
                      <option value="custom">Custom...</option>
                    </select>

                    {/* Exact Custom Duration Input (Single decimal point accuracy) */}
                    <div className="flex items-center gap-1 pl-1 border-l border-neutral-800">
                      <input
                        type="number"
                        id="walkthrough-custom-duration-input"
                        step="0.1"
                        min="0.5"
                        max="60.0"
                        value={customInputVal}
                        onChange={(e) => {
                          setCustomInputVal(e.target.value);
                          const parsed = parseFloat(e.target.value);
                          if (!isNaN(parsed) && parsed >= 0.5 && parsed <= 60.0) {
                            const rounded = Math.round(parsed * 10) / 10;
                            onChangeDuration && onChangeDuration(rounded);
                          }
                        }}
                        onBlur={() => {
                          let parsed = parseFloat(customInputVal);
                          if (isNaN(parsed) || parsed < 0.5) parsed = 4.0;
                          if (parsed > 60.0) parsed = 60.0;
                          const rounded = Math.round(parsed * 10) / 10;
                          setCustomInputVal(rounded.toFixed(1));
                          onChangeDuration && onChangeDuration(rounded);
                        }}
                        className="w-16 bg-neutral-900 border border-sky-600/50 hover:border-sky-400 focus:border-sky-400 text-sky-300 font-mono text-[11px] text-center rounded px-1 py-0.5 focus:outline-none font-bold"
                        placeholder="4.0"
                        title="Type exact clip duration with a single decimal point of accuracy (e.g. 3.7)"
                      />
                      <span className="text-neutral-400 font-mono text-[11px]">s</span>
                    </div>
                  </div>

                  {/* Primary Body Part */}
                  <div className="flex items-center gap-1.5 bg-neutral-950/90 px-2.5 py-1 rounded-lg border border-neutral-800 text-[11px]">
                    <span className="text-neutral-400 font-medium">1st Pass Limb:</span>
                    <select
                      id="walkthrough-primary-limb-select"
                      value={primaryLimb}
                      onChange={(e) => onSelectPrimaryLimb && onSelectPrimaryLimb(e.target.value as LimbId)}
                      className="bg-neutral-900 border border-neutral-700 text-white font-medium text-[11px] rounded px-2 py-0.5 focus:outline-none focus:border-sky-500"
                    >
                      {LIMB_ORDER.map((id) => (
                        <option key={id} value={id}>
                          {LIMB_CONFIGS[id].name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Secondary Body Part to Stack */}
                  <div className="flex items-center gap-1.5 bg-neutral-950/90 px-2.5 py-1 rounded-lg border border-neutral-800 text-[11px]">
                    <span className="text-neutral-400 font-medium">2nd Stack Limb:</span>
                    <select
                      id="walkthrough-secondary-limb-select"
                      value={secondaryLimb}
                      onChange={(e) => onSelectSecondaryLimb && onSelectSecondaryLimb(e.target.value as LimbId)}
                      className="bg-neutral-900 border border-neutral-700 text-white font-medium text-[11px] rounded px-2 py-0.5 focus:outline-none focus:border-sky-500"
                    >
                      {LIMB_ORDER.map((id) => (
                        <option key={id} value={id}>
                          {LIMB_CONFIGS[id].name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0 self-end lg:self-center mt-2 lg:mt-0">
              <button
                id="btn-walkthrough-select-hand"
                onClick={() => onSelectLimb(primaryLimb)}
                className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition-colors border border-neutral-700"
              >
                Focus {primaryConfig.name}
              </button>
              <button
                id="btn-walkthrough-proceed-record-hand"
                onClick={onNextStep}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow transition-all"
              >
                <span>Proceed to Record ({duration.toFixed(1)}s)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Record Pass 1 */}
        {currentStep === 'record_hand' && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex-1 flex items-start sm:items-center gap-3">
              <div
                className="p-2.5 rounded-lg border shrink-0"
                style={{ backgroundColor: `${primaryConfig.color}20`, borderColor: `${primaryConfig.color}50` }}
              >
                <Radio className="w-5 h-5 animate-pulse" style={{ color: primaryConfig.color }} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  Step 2: Record Pass 1 — {primaryConfig.name} ({duration.toFixed(1)}s)
                  {handKeyframeCount > 0 && !isRecording && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> {handKeyframeCount} frames recorded!
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-neutral-300 mt-0.5">
                  {isRecording
                    ? `Recording in progress! Move and rotate the ${primaryConfig.name} as timeline advances...`
                    : countIn > 0
                    ? `Get ready to puppeteer ${primaryConfig.name}! Starting in ${countIn}...`
                    : `Hit "Record ${primaryConfig.name} Pass" below. As the ${duration.toFixed(1)}s timeline plays, puppeteer the limb to capture keyframes.`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                id="btn-walkthrough-record-hand"
                onClick={onStartRecord}
                disabled={isRecording || countIn > 0}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold shadow transition-all"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>{isRecording ? `Recording ${primaryConfig.name}...` : `Record ${primaryConfig.name} (${duration.toFixed(1)}s)`}</span>
              </button>

              {handKeyframeCount > 0 && !isRecording && (
                <button
                  id="btn-walkthrough-to-foot"
                  onClick={onNextStep}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow transition-all"
                >
                  <span>Next: Stack {secondaryConfig.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Record Pass 2 (Stacking) */}
        {currentStep === 'record_foot' && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex-1 flex items-start sm:items-center gap-3">
              <div
                className="p-2.5 rounded-lg border shrink-0"
                style={{ backgroundColor: `${secondaryConfig.color}20`, borderColor: `${secondaryConfig.color}50` }}
              >
                <Layers className="w-5 h-5" style={{ color: secondaryConfig.color }} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  Step 3: Stack Layer 2 — {secondaryConfig.name} ({duration.toFixed(1)}s)
                  {footKeyframeCount > 0 && !isRecording && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> {footKeyframeCount} frames recorded!
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-neutral-300 mt-0.5">
                  {isRecording
                    ? `Now move the ${secondaryConfig.name}! Notice how ${primaryConfig.name} plays back your recorded performance in sync!`
                    : countIn > 0
                    ? `Ready to puppeteer ${secondaryConfig.name}! Starting in ${countIn}...`
                    : `${secondaryConfig.name} is armed. Hit "Record ${secondaryConfig.name} Pass" to capture motion while ${primaryConfig.name} plays back in sync!`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                id="btn-walkthrough-record-foot"
                onClick={onStartRecord}
                disabled={isRecording || countIn > 0}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-bold shadow transition-all"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>{isRecording ? `Recording ${secondaryConfig.name}...` : `Record ${secondaryConfig.name} Pass (${duration.toFixed(1)}s)`}</span>
              </button>

              {footKeyframeCount > 0 && !isRecording && (
                <button
                  id="btn-walkthrough-finish"
                  onClick={onNextStep}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition-all"
                >
                  <span>Finish &amp; Play Stacking</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Completed */}
        {currentStep === 'completed' && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex-1 flex items-start sm:items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  🎉 Stacking Mastered!
                </h4>
                <p className="text-[11px] text-neutral-300 mt-0.5">
                  You've successfully recorded and stacked two distinct movement layers ({primaryConfig.name} + {secondaryConfig.name}) over {duration.toFixed(1)}s! Both passes now loop in synchronized harmony.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                id="btn-walkthrough-play"
                onClick={onTogglePlay}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isPlaying ? 'Pause Preview' : 'Play Stacked Loop'}</span>
              </button>
              <button
                id="btn-walkthrough-re-record-foot"
                onClick={() => {
                  onSelectLimb(secondaryLimb);
                  onStartRecord();
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Re-record Layer 2</span>
              </button>
              <button
                id="btn-walkthrough-dismiss-final"
                onClick={onDismiss}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
