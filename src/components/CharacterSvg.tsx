import React from 'react';
import { LIMB_CONFIGS } from '../constants/defaultCharacter';
import { LimbId, LimbPivots, PuppetPose } from '../types';
import { ParsedCharacterSvg } from '../utils/customSvgManager';

interface CharacterSvgProps {
  pose: PuppetPose;
  pivots?: LimbPivots;
  selectedLimb?: LimbId | null;
  onSelectLimb?: (limbId: LimbId) => void;
  interactive?: boolean;
  showVignette?: boolean;
  opacity?: number;
  idPrefix?: string;
  className?: string;
  ghostPose?: PuppetPose | null;
  customSvg?: ParsedCharacterSvg;
}

export const CharacterSvg: React.FC<CharacterSvgProps> = ({
  pose,
  pivots,
  selectedLimb = null,
  onSelectLimb,
  interactive = false,
  showVignette = true,
  opacity = 1,
  idPrefix = 'char_',
  className = '',
  ghostPose = null,
  customSvg,
}) => {
  const getLimbTransform = (limbId: LimbId, p: PuppetPose) => {
    const config = LIMB_CONFIGS[limbId];
    const limbPose = p[limbId] || { rotation: 0, x: 0, y: 0, scaleX: 1, scaleY: 1 };
    const px = pivots?.[limbId]?.x ?? config.pivot.x;
    const py = pivots?.[limbId]?.y ?? config.pivot.y;

    // Notice: For handL, default base rotation was -90 in original SVG.
    // For footL: default was rotate(-10). For footR: rotate(10).
    // Our limbPose.rotation represents total current rotation!
    const rot = limbPose.rotation;
    const tx = limbPose.x || 0;
    const ty = limbPose.y || 0;
    const sx = limbPose.scaleX ?? 1;
    const sy = limbPose.scaleY ?? 1;

    let transform = `translate(${tx}, ${ty}) rotate(${rot}, ${px}, ${py})`;
    if (sx !== 1 || sy !== 1) {
      // Scale around pivot
      transform += ` translate(${px}, ${py}) scale(${sx}, ${sy}) translate(${-px}, ${-py})`;
    }
    return transform;
  };

  const getSelectionFilter = (limbId: LimbId) => {
    if (!interactive) return undefined;
    if (selectedLimb === limbId) {
      return `drop-shadow(0 0 6px ${LIMB_CONFIGS[limbId].color}) drop-shadow(0 0 2px #ffffff)`;
    }
    return undefined;
  };

  const renderLimbGroup = (p: PuppetPose, isGhost = false) => {
    const bTrans = getLimbTransform('body', p);
    const hTrans = getLimbTransform('head', p);
    const hlTrans = getLimbTransform('handL', p);
    const hrTrans = getLimbTransform('handR', p);
    const flTrans = getLimbTransform('footL', p);
    const frTrans = getLimbTransform('footR', p);
    const elTrans = getLimbTransform('earL', p);
    const erTrans = getLimbTransform('earR', p);
    const snTrans = getLimbTransform('snout', p);
    const eyTrans = getLimbTransform('eyes', p);

    return (
      <g
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={isGhost ? 0.35 : 1}
      >
        {/* Foot L (Left Leg) */}
        <g
          id={`limb-footL${isGhost ? '-ghost' : ''}`}
          transform={flTrans}
          className={interactive ? 'cursor-pointer hover:opacity-90' : ''}
          onClick={(e) => {
            if (interactive && onSelectLimb) {
              e.stopPropagation();
              onSelectLimb('footL');
            }
          }}
          filter={!isGhost ? getSelectionFilter('footL') : undefined}
        >
          {customSvg?.limbMarkup?.footL !== undefined ? (
            customSvg.limbMarkup.footL ? (
              <g dangerouslySetInnerHTML={{ __html: customSvg.limbMarkup.footL }} />
            ) : null
          ) : (
            <>
              <path
                d="M 151 240 v 28 a 15 3 0 0 0 49 0 v -28 a 15 3 0 0 0 -49 0"
                fill="pink"
                stroke="#123"
                strokeWidth="2"
              />
              <path
                d="M 175 272.9 l 7 -7.9 l 18 3 c 0 3 -13 5 -25 4.9 c -11 0.1 -24 -1.9 -24 -4.9 l 17 -3 z"
                fill="#d99"
                stroke="#123"
                strokeWidth="1"
              />
            </>
          )}
        </g>

        {/* Foot R (Right Leg) */}
        <g
          id={`limb-footR${isGhost ? '-ghost' : ''}`}
          transform={frTrans}
          className={interactive ? 'cursor-pointer hover:opacity-90' : ''}
          onClick={(e) => {
            if (interactive && onSelectLimb) {
              e.stopPropagation();
              onSelectLimb('footR');
            }
          }}
          filter={!isGhost ? getSelectionFilter('footR') : undefined}
        >
          {customSvg?.limbMarkup?.footR !== undefined ? (
            customSvg.limbMarkup.footR ? (
              <g dangerouslySetInnerHTML={{ __html: customSvg.limbMarkup.footR }} />
            ) : null
          ) : (
            <>
              <path
                d="M 101 240 v 28 a 15 3 0 0 0 49 0 v -28 a 15 3 0 0 0 -49 0"
                fill="pink"
                stroke="#123"
                strokeWidth="2"
              />
              <path
                d="M 125 272.9 l 7 -7.9 l 18 3 c 0 3 -13 5 -25 4.9 c -11 0.1 -24 -1.9 -24 -4.9 l 17 -3 z"
                fill="#d99"
                stroke="#123"
                strokeWidth="1"
              />
            </>
          )}
        </g>

        {/* Body & Belt */}
        <g
          id={`limb-body${isGhost ? '-ghost' : ''}`}
          transform={bTrans}
          className={interactive ? 'cursor-pointer hover:opacity-90' : ''}
          onClick={(e) => {
            if (interactive && onSelectLimb) {
              e.stopPropagation();
              onSelectLimb('body');
            }
          }}
          filter={!isGhost ? getSelectionFilter('body') : undefined}
        >
          {customSvg?.limbMarkup?.body !== undefined ? (
            customSvg.limbMarkup.body ? (
              <g dangerouslySetInnerHTML={{ __html: customSvg.limbMarkup.body }} />
            ) : null
          ) : (
            <>
              <path
                d="M 150 100 a 90 75 0 1 0 0.01 0"
                fill="lightblue"
                stroke="#123"
                strokeWidth="2"
              />
              <path
                d="M 61 178 q 89 -18 178 0"
                fill="none"
                stroke="#123"
                strokeWidth="5"
              />
              <g transform="translate(-50 -5)">
                <path
                  d="M 168 167 l 15 -14 h 51 l 8 10 v 24 l -13 16 h -44 l -17 -9 z"
                  fill="silver"
                  stroke="#123"
                  strokeWidth="2"
                />
                <path
                  d="M 201 176 c -14 -8 -13 -26 6 -27 l 2 -8 l 5 1 l -2 8 q 2 0 6 1 l 2 -8 l 5 1 l -2 9 c 8 3 12 11 10 17 c -2 5 -11 4 -9 -4 l 1 -7 l -3 -2 l -5 20 c 21 13 11 32 -7 31 l -2 9 l -5 -2 l 2 -8 q -3 0 -5 -1 l -2 8 l -6 -2 l 2 -7 c -8 -4 -12 -10 -12 -15 c 0 -13 16 -13 12 0 l -2 6 l 4 3 z m 10 27 c 8 2 14 -11 4 -18 z m -5 -49 c -9 3 -8 11 -3 13 z"
                  fill="gold"
                  stroke="#123"
                  strokeWidth="2"
                />
              </g>
              <path
                d="M 150 100 a 45 14 0 1 0 0.01 0"
                fill="pink"
                stroke="#123"
                strokeWidth="2"
              />
            </>
          )}
        </g>

        {/* Head & Facial Features */}
        <g
          id={`limb-head${isGhost ? '-ghost' : ''}`}
          transform={hTrans}
          className={interactive ? 'cursor-pointer hover:opacity-90' : ''}
          onClick={(e) => {
            if (interactive && onSelectLimb) {
              e.stopPropagation();
              onSelectLimb('head');
            }
          }}
          filter={!isGhost ? getSelectionFilter('head') : undefined}
        >
          {/* Head Base: Custom or Default */}
          {customSvg?.limbMarkup?.head !== undefined ? (
            customSvg.limbMarkup.head ? (
              <g dangerouslySetInnerHTML={{ __html: customSvg.limbMarkup.head }} />
            ) : null
          ) : (
            <path
              d="M 121 103 a 42 42 0 1 1 61 1 a 36 11 0 1 1 -61 -1 z"
              fill="pink"
              stroke="#123"
              strokeWidth="2"
            />
          )}

          {/* Left Ear */}
          <g
            id={`limb-earL${isGhost ? '-ghost' : ''}`}
            transform={elTrans}
            className={interactive ? 'cursor-pointer' : ''}
            onClick={(e) => {
              if (interactive && onSelectLimb) {
                e.stopPropagation();
                onSelectLimb('earL');
              }
            }}
            filter={!isGhost ? getSelectionFilter('earL') : undefined}
          >
            {customSvg?.limbMarkup?.earL !== undefined ? (
              customSvg.limbMarkup.earL ? (
                <g dangerouslySetInnerHTML={{ __html: customSvg.limbMarkup.earL }} />
              ) : null
            ) : (
              <>
                <path d="M 173 46 l 11 0 l 6 13 z" fill="#c00" />
                <path
                  d="M 171 38 l 19 0 l 3 25 l -15 -17 l -5 0"
                  fill="pink"
                />
                <path
                  d="M 171 38 l 19 0 l 3 25 l -15 -17"
                  fill="none"
                  stroke="#123"
                  strokeWidth="2"
                />
              </>
            )}
          </g>

          {/* Right Ear */}
          <g
            id={`limb-earR${isGhost ? '-ghost' : ''}`}
            transform={erTrans}
            className={interactive ? 'cursor-pointer' : ''}
            onClick={(e) => {
              if (interactive && onSelectLimb) {
                e.stopPropagation();
                onSelectLimb('earR');
              }
            }}
            filter={!isGhost ? getSelectionFilter('earR') : undefined}
          >
            {customSvg?.limbMarkup?.earR !== undefined ? (
              customSvg.limbMarkup.earR ? (
                <g dangerouslySetInnerHTML={{ __html: customSvg.limbMarkup.earR }} />
              ) : null
            ) : (
              <>
                <path d="M 119 52 l 17 -11 l -15 -2 z" fill="#c00" />
                <path
                  d="M 136 36 l -20 -3 l -6 32 l 18 -24 l 8 1"
                  fill="pink"
                />
                <path
                  d="M 136 36 l -20 -3 l -6 32 l 18 -24"
                  fill="none"
                  stroke="#123"
                  strokeWidth="2"
                />
              </>
            )}
          </g>

          {/* Eyes */}
          <g
            id={`limb-eyes${isGhost ? '-ghost' : ''}`}
            transform={eyTrans}
            className={interactive ? 'cursor-pointer' : ''}
            onClick={(e) => {
              if (interactive && onSelectLimb) {
                e.stopPropagation();
                onSelectLimb('eyes');
              }
            }}
            filter={!isGhost ? getSelectionFilter('eyes') : undefined}
          >
            {customSvg?.limbMarkup?.eyes !== undefined ? (
              customSvg.limbMarkup.eyes ? (
                <g dangerouslySetInnerHTML={{ __html: customSvg.limbMarkup.eyes }} />
              ) : null
            ) : (
              <>
                <path
                  d="M 127 66 q 11 -10 23 3"
                  fill="none"
                  stroke="#123"
                  strokeWidth="4"
                />
                <path
                  d="M 157 68 q 11 -12 23 -3"
                  fill="none"
                  stroke="#123"
                  strokeWidth="4"
                />
              </>
            )}
          </g>

          {/* Snout & Nostrils */}
          <g
            id={`limb-snout${isGhost ? '-ghost' : ''}`}
            transform={snTrans}
            className={interactive ? 'cursor-pointer' : ''}
            onClick={(e) => {
              if (interactive && onSelectLimb) {
                e.stopPropagation();
                onSelectLimb('snout');
              }
            }}
            filter={!isGhost ? getSelectionFilter('snout') : undefined}
          >
            {customSvg?.limbMarkup?.snout !== undefined ? (
              customSvg.limbMarkup.snout ? (
                <g dangerouslySetInnerHTML={{ __html: customSvg.limbMarkup.snout }} />
              ) : null
            ) : (
              <>
                <path
                  fill="lightpink"
                  d="M 141 74 q 0 9 12 9 q 12 0 12 -9 q 0 -9 -12 -9 q -12 0 -12 9"
                />
                <path
                  fill="pink"
                  stroke="#123"
                  strokeWidth="2"
                  d="M 141 77 q 0 9 12 9 q 12 0 12 -9 q 0 -9 -12 -9 q -12 0 -12 9"
                />
                <path
                  fill="none"
                  stroke="#123"
                  strokeLinecap="round"
                  strokeWidth="4"
                  d="M149 80 v -6 m 8 6 v -6"
                />
              </>
            )}
          </g>
        </g>

        {/* Hand L (Left Arm) - Rendered in front of body */}
        <g
          id={`limb-handL${isGhost ? '-ghost' : ''}`}
          transform={hlTrans}
          className={interactive ? 'cursor-pointer hover:opacity-90' : ''}
          onClick={(e) => {
            if (interactive && onSelectLimb) {
              e.stopPropagation();
              onSelectLimb('handL');
            }
          }}
          filter={!isGhost ? getSelectionFilter('handL') : undefined}
        >
          {customSvg?.limbMarkup?.handL !== undefined ? (
            customSvg.limbMarkup.handL ? (
              <g dangerouslySetInnerHTML={{ __html: customSvg.limbMarkup.handL }} />
            ) : null
          ) : (
            <path
              d="M 220 160 a 18 14 0 1 1 23 0 l -6 12 l -5 -7 l -6 7 z"
              fill="pink"
              stroke="#123"
              strokeWidth="2"
            />
          )}
        </g>

        {/* Hand R (Right Arm) - Rendered in front of body */}
        <g
          id={`limb-handR${isGhost ? '-ghost' : ''}`}
          transform={hrTrans}
          className={interactive ? 'cursor-pointer hover:opacity-90' : ''}
          onClick={(e) => {
            if (interactive && onSelectLimb) {
              e.stopPropagation();
              onSelectLimb('handR');
            }
          }}
          filter={!isGhost ? getSelectionFilter('handR') : undefined}
        >
          {customSvg?.limbMarkup?.handR !== undefined ? (
            customSvg.limbMarkup.handR ? (
              <g dangerouslySetInnerHTML={{ __html: customSvg.limbMarkup.handR }} />
            ) : null
          ) : (
            <path
              d="M 79 170 a 18 14 0 1 1 23 0 l -6 12 l -5 -7 l -6 7 z"
              fill="pink"
              stroke="#123"
              strokeWidth="2"
            />
          )}
        </g>
      </g>
    );
  };

  const maskId = `${idPrefix}bodyMask`;
  const gradId = `${idPrefix}bodyGrad`;
  const pigId = `${idPrefix}pigDef`;

  return (
    <svg
      viewBox="0 0 300 300"
      id={`${idPrefix}taxesFront`}
      className={`select-none ${className}`}
      style={{ opacity }}
    >
      <defs>
        <radialGradient id={gradId}>
          <stop offset="0%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor={customSvg?.insetShadowColorStop || "rgba(0,0,0,0.45)"} />
        </radialGradient>

        <mask id={maskId}>
          <g filter="brightness(0) invert(1)">
            {renderLimbGroup(pose)}
          </g>
        </mask>
      </defs>

      {/* Ghosting / Onion Skin */}
      {ghostPose && (
        <g opacity="0.4" filter="hue-rotate(180deg)">
          {renderLimbGroup(ghostPose, true)}
        </g>
      )}

      {/* Main Pig Character */}
      {renderLimbGroup(pose)}

      {/* Vignette Shadow Overlay (Respects custom SVG code: enabled only if inset shadow exists in code) */}
      {showVignette && (customSvg ? customSvg.hasInsetShadow : true) && (
        <circle
          cx="150"
          cy="150"
          r="190"
          fill={`url(#${gradId})`}
          mask={`url(#${maskId})`}
          pointerEvents="none"
        />
      )}
    </svg>
  );
};
