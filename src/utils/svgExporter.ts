import { LIMB_CONFIGS, LIMB_ORDER } from '../constants/defaultCharacter';
import { LayerTrack, LimbId, LimbPivots, PuppetPose } from '../types';
import { interpolatePoseAtTime } from './motionSmoothing';
import { ParsedCharacterSvg } from './customSvgManager';

/**
 * Generates a standalone, fully self-contained Animated SVG file using pure CSS @keyframes.
 * Works natively in any modern browser and vector tools.
 */
export function generateAnimatedSvg(
  tracks: Record<LimbId, LayerTrack>,
  duration: number,
  fps = 30,
  pivots?: LimbPivots,
  customSvg?: ParsedCharacterSvg
): string {
  const steps = Math.round(duration * fps);
  let cssKeyframes = '';

  LIMB_ORDER.forEach((limbId) => {
    const track = tracks[limbId];
    const config = LIMB_CONFIGS[limbId];
    const keyframes = track?.keyframes || [];
    const px = pivots?.[limbId]?.x ?? config.pivot.x;
    const py = pivots?.[limbId]?.y ?? config.pivot.y;

    let keyframeBody = '';
    for (let step = 0; step <= steps; step++) {
      const t = (step / steps) * duration;
      const pct = ((step / steps) * 100).toFixed(2);
      const pose = interpolatePoseAtTime(
        keyframes,
        t,
        duration,
        { rotation: config.baseRotation, x: 0, y: 0, scaleX: 1, scaleY: 1 }
      );

      const rot = pose.rotation * (track?.weight ?? 1);
      const tx = pose.x * (track?.weight ?? 1);
      const ty = pose.y * (track?.weight ?? 1);
      const sx = pose.scaleX ?? 1;
      const sy = pose.scaleY ?? 1;

      let transform = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) rotate(${rot.toFixed(1)}deg)`;
      if (sx !== 1 || sy !== 1) {
        transform += ` scale(${sx.toFixed(2)}, ${sy.toFixed(2)})`;
      }

      keyframeBody += `    ${pct}% { transform: ${transform}; }\n`;
    }

    cssKeyframes += `
  @keyframes anim_${limbId} {
${keyframeBody}  }
  .anim-${limbId} {
    animation: anim_${limbId} ${duration}s linear infinite;
    transform-origin: ${px}px ${py}px;
    transform-box: fill-box;
  }
`;
  });

  const getLimbContent = (limbId: LimbId, defaultContent: string) => {
    return customSvg?.limbMarkup?.[limbId] || defaultContent;
  };

  const hasInset = customSvg ? customSvg.hasInsetShadow : true;

  return `<!-- Generated with PiggyMotion Puppeteer Studio -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" id="taxesFront">
  <style>
${cssKeyframes}
  </style>
  <defs>
    <radialGradient id="bodyGrad">
      <stop offset="0%" stop-color="rgba(0,0,0,0)" />
      <stop offset="100%" stop-color="rgba(0,0,0,0.5)" />
    </radialGradient>
    <mask id="bodyMask">
      <use href="#pig" filter="brightness(0) invert(1)" />
    </mask>

    <g stroke-linecap="round" stroke-linejoin="round" id="pig">
      <!-- Foot L -->
      <g class="anim-footL">
        ${getLimbContent('footL', `<path d="M 151 240 v 28 a 15 3 0 0 0 49 0 v -28 a 15 3 0 0 0 -49 0" fill="pink" stroke="#123" stroke-width="2" />\n        <path d="M 175 272.9 l 7 -7.9 l 18 3 c 0 3 -13 5 -25 4.9 c -11 0.1 -24 -1.9 -24 -4.9 l 17 -3 z" fill="#d99" stroke="#123" stroke-width="1" />`)}
      </g>

      <!-- Foot R -->
      <g class="anim-footR">
        ${getLimbContent('footR', `<path d="M 101 240 v 28 a 15 3 0 0 0 49 0 v -28 a 15 3 0 0 0 -49 0" fill="pink" stroke="#123" stroke-width="2" />\n        <path d="M 125 272.9 l 7 -7.9 l 18 3 c 0 3 -13 5 -25 4.9 c -11 0.1 -24 -1.9 -24 -4.9 l 17 -3 z" fill="#d99" stroke="#123" stroke-width="1" />`)}
      </g>

      <!-- Body & Belt -->
      <g class="anim-body">
        ${getLimbContent('body', `<path d="M 150 100 a 90 75 0 1 0 0.01 0" fill="lightblue" stroke="#123" stroke-width="2" />\n        <path d="M 61 178 q 89 -18 178 0" fill="none" stroke="#123" stroke-width="5" />\n        <g transform="translate(-50 -5)">\n          <path d="M 168 167 l 15 -14 h 51 l 8 10 v 24 l -13 16 h -44 l -17 -9 z" fill="silver" stroke="#123" stroke-width="2" />\n          <path d="M 201 176 c -14 -8 -13 -26 6 -27 l 2 -8 l 5 1 l -2 8 q 2 0 6 1 l 2 -8 l 5 1 l -2 9 c 8 3 12 11 10 17 c -2 5 -11 4 -9 -4 l 1 -7 l -3 -2 l -5 20 c 21 13 11 32 -7 31 l -2 9 l -5 -2 l 2 -8 q -3 0 -5 -1 l -2 8 l -6 -2 l 2 -7 c -8 -4 -12 -10 -12 -15 c 0 -13 16 -13 12 0 l -2 6 l 4 3 z m 10 27 c 8 2 14 -11 4 -18 z m -5 -49 c -9 3 -8 11 -3 13 z" fill="gold" stroke="#123" stroke-width="2" />\n        </g>\n        <path d="M 150 100 a 45 14 0 1 0 0.01 0" fill="pink" stroke="#123" stroke-width="2" />`)}
      </g>

      <!-- Head & Facial Features -->
      <g class="anim-head">
        ${getLimbContent('head', `<path d="M 121 103 a 42 42 0 1 1 61 1 a 36 11 0 1 1 -61 -1 z" fill="pink" stroke="#123" stroke-width="2" />`)}

        <!-- Ear L -->
        <g class="anim-earL">
          ${getLimbContent('earL', `<path d="M 173 46 l 11 0 l 6 13 z" fill="#c00" />\n          <path d="M 171 38 l 19 0 l 3 25 l -15 -17 l -5 0" fill="pink" />\n          <path d="M 171 38 l 19 0 l 3 25 l -15 -17" fill="none" stroke="#123" stroke-width="2" />`)}
        </g>

        <!-- Ear R -->
        <g class="anim-earR">
          ${getLimbContent('earR', `<path d="M 119 52 l 17 -11 l -15 -2 z" fill="#c00" />\n          <path d="M 136 36 l -20 -3 l -6 32 l 18 -24 l 8 1" fill="pink" />\n          <path d="M 136 36 l -20 -3 l -6 32 l 18 -24" fill="none" stroke="#123" stroke-width="2" />`)}
        </g>

        <!-- Eyes -->
        <g class="anim-eyes">
          ${getLimbContent('eyes', `<path d="M 127 66 q 11 -10 23 3" fill="none" stroke="#123" stroke-width="4" />\n          <path d="M 157 68 q 11 -12 23 -3" fill="none" stroke="#123" stroke-width="4" />`)}
        </g>

        <!-- Snout -->
        <g class="anim-snout">
          ${getLimbContent('snout', `<path fill="lightpink" d="M 141 74 q 0 9 12 9 q 12 0 12 -9 q 0 -9 -12 -9 q -12 0 -12 9" />\n          <path fill="pink" stroke="#123" stroke-width="2" d="M 141 77 q 0 9 12 9 q 12 0 12 -9 q 0 -9 -12 -9 q -12 0 -12 9" />\n          <path fill="none" stroke="#123" stroke-linecap="round" stroke-width="4" d="M149 80 v -6 m 8 6 v -6" />`)}
        </g>
      </g>

      <!-- Hand L (in front of body) -->
      <g class="anim-handL">
        ${getLimbContent('handL', `<path d="M 220 160 a 18 14 0 1 1 23 0 l -6 12 l -5 -7 l -6 7 z" fill="pink" stroke="#123" stroke-width="2" />`)}
      </g>

      <!-- Hand R (in front of body) -->
      <g class="anim-handR">
        ${getLimbContent('handR', `<path d="M 79 170 a 18 14 0 1 1 23 0 l -6 12 l -5 -7 l -6 7 z" fill="pink" stroke="#123" stroke-width="2" />`)}
      </g>
    </g>
  </defs>

  <use href="#pig" />
  ${hasInset ? `<circle cx="150" cy="150" r="200" fill="url(#bodyGrad)" mask="url(#bodyMask)" />` : ''}
</svg>`;
}

/**
 * Generates a static SVG string for a specific character pose,
 * using standard SVG transform attributes for guaranteed canvas/image rendering.
 */
export function generateStaticPoseSvg(
  pose: PuppetPose,
  pivots?: LimbPivots,
  width?: number,
  height?: number,
  customSvg?: ParsedCharacterSvg
): string {
  const getTransform = (limbId: LimbId) => {
    const config = LIMB_CONFIGS[limbId];
    const p = pose[limbId] || { rotation: config.baseRotation, x: 0, y: 0, scaleX: 1, scaleY: 1 };
    const px = pivots?.[limbId]?.x ?? config.pivot.x;
    const py = pivots?.[limbId]?.y ?? config.pivot.y;
    const tx = p.x || 0;
    const ty = p.y || 0;
    const rot = p.rotation || 0;
    const sx = p.scaleX ?? 1;
    const sy = p.scaleY ?? 1;

    let t = `translate(${tx} ${ty}) translate(${px} ${py}) rotate(${rot})`;
    if (sx !== 1 || sy !== 1) {
      t += ` scale(${sx} ${sy})`;
    }
    t += ` translate(${-px} ${-py})`;
    return t;
  };

  const getLimbContent = (limbId: LimbId, defaultContent: string) => {
    return customSvg?.limbMarkup?.[limbId] || defaultContent;
  };

  const hasInset = customSvg ? customSvg.hasInsetShadow : true;
  const widthAttr = width ? ` width="${width}"` : '';
  const heightAttr = height ? ` height="${height}"` : '';

  return `<!-- Generated Frame from PiggyMotion Studio -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"${widthAttr}${heightAttr}>
  <defs>
    <radialGradient id="frameBodyGrad">
      <stop offset="0%" stop-color="rgba(0,0,0,0)" />
      <stop offset="100%" stop-color="rgba(0,0,0,0.5)" />
    </radialGradient>
    <mask id="frameBodyMask">
      <use href="#framePig" filter="brightness(0) invert(1)" />
    </mask>

    <g stroke-linecap="round" stroke-linejoin="round" id="framePig">
      <!-- Foot L -->
      <g transform="${getTransform('footL')}">
        ${getLimbContent('footL', `<path d="M 151 240 v 28 a 15 3 0 0 0 49 0 v -28 a 15 3 0 0 0 -49 0" fill="pink" stroke="#123" stroke-width="2" />\n        <path d="M 175 272.9 l 7 -7.9 l 18 3 c 0 3 -13 5 -25 4.9 c -11 0.1 -24 -1.9 -24 -4.9 l 17 -3 z" fill="#d99" stroke="#123" stroke-width="1" />`)}
      </g>

      <!-- Foot R -->
      <g transform="${getTransform('footR')}">
        ${getLimbContent('footR', `<path d="M 101 240 v 28 a 15 3 0 0 0 49 0 v -28 a 15 3 0 0 0 -49 0" fill="pink" stroke="#123" stroke-width="2" />\n        <path d="M 125 272.9 l 7 -7.9 l 18 3 c 0 3 -13 5 -25 4.9 c -11 0.1 -24 -1.9 -24 -4.9 l 17 -3 z" fill="#d99" stroke="#123" stroke-width="1" />`)}
      </g>

      <!-- Body & Belt -->
      <g transform="${getTransform('body')}">
        ${getLimbContent('body', `<path d="M 150 100 a 90 75 0 1 0 0.01 0" fill="lightblue" stroke="#123" stroke-width="2" />\n        <path d="M 61 178 q 89 -18 178 0" fill="none" stroke="#123" stroke-width="5" />\n        <g transform="translate(-50 -5)">\n          <path d="M 168 167 l 15 -14 h 51 l 8 10 v 24 l -13 16 h -44 l -17 -9 z" fill="silver" stroke="#123" stroke-width="2" />\n          <path d="M 201 176 c -14 -8 -13 -26 6 -27 l 2 -8 l 5 1 l -2 8 q 2 0 6 1 l 2 -8 l 5 1 l -2 9 c 8 3 12 11 10 17 c -2 5 -11 4 -9 -4 l 1 -7 l -3 -2 l -5 20 c 21 13 11 32 -7 31 l -2 9 l -5 -2 l 2 -8 q -3 0 -5 -1 l -2 8 l -6 -2 l 2 -7 c -8 -4 -12 -10 -12 -15 c 0 -13 16 -13 12 0 l -2 6 l 4 3 z m 10 27 c 8 2 14 -11 4 -18 z m -5 -49 c -9 3 -8 11 -3 13 z" fill="gold" stroke="#123" stroke-width="2" />\n        </g>\n        <path d="M 150 100 a 45 14 0 1 0 0.01 0" fill="pink" stroke="#123" stroke-width="2" />`)}
      </g>

      <!-- Head & Facial Features -->
      <g transform="${getTransform('head')}">
        ${getLimbContent('head', `<path d="M 121 103 a 42 42 0 1 1 61 1 a 36 11 0 1 1 -61 -1 z" fill="pink" stroke="#123" stroke-width="2" />`)}

        <!-- Ear L -->
        <g transform="${getTransform('earL')}">
          ${getLimbContent('earL', `<path d="M 173 46 l 11 0 l 6 13 z" fill="#c00" />\n          <path d="M 171 38 l 19 0 l 3 25 l -15 -17 l -5 0" fill="pink" />\n          <path d="M 171 38 l 19 0 l 3 25 l -15 -17" fill="none" stroke="#123" stroke-width="2" />`)}
        </g>

        <!-- Ear R -->
        <g transform="${getTransform('earR')}">
          ${getLimbContent('earR', `<path d="M 119 52 l 17 -11 l -15 -2 z" fill="#c00" />\n          <path d="M 136 36 l -20 -3 l -6 32 l 18 -24 l 8 1" fill="pink" />\n          <path d="M 136 36 l -20 -3 l -6 32 l 18 -24" fill="none" stroke="#123" stroke-width="2" />`)}
        </g>

        <!-- Eyes -->
        <g transform="${getTransform('eyes')}">
          ${getLimbContent('eyes', `<path d="M 127 66 q 11 -10 23 3" fill="none" stroke="#123" stroke-width="4" />\n          <path d="M 157 68 q 11 -12 23 -3" fill="none" stroke="#123" stroke-width="4" />`)}
        </g>

        <!-- Snout -->
        <g transform="${getTransform('snout')}">
          ${getLimbContent('snout', `<path fill="lightpink" d="M 141 74 q 0 9 12 9 q 12 0 12 -9 q 0 -9 -12 -9 q -12 0 -12 9" />\n          <path fill="pink" stroke="#123" stroke-width="2" d="M 141 77 q 0 9 12 9 q 12 0 12 -9 q 0 -9 -12 -9 q -12 0 -12 9" />\n          <path fill="none" stroke="#123" stroke-linecap="round" stroke-width="4" d="M149 80 v -6 m 8 6 v -6" />`)}
        </g>
      </g>

      <!-- Hand L (in front of body) -->
      <g transform="${getTransform('handL')}">
        ${getLimbContent('handL', `<path d="M 220 160 a 18 14 0 1 1 23 0 l -6 12 l -5 -7 l -6 7 z" fill="pink" stroke="#123" stroke-width="2" />`)}
      </g>

      <!-- Hand R (in front of body) -->
      <g transform="${getTransform('handR')}">
        ${getLimbContent('handR', `<path d="M 79 170 a 18 14 0 1 1 23 0 l -6 12 l -5 -7 l -6 7 z" fill="pink" stroke="#123" stroke-width="2" />`)}
      </g>
    </g>
  </defs>

  <use href="#framePig" />
  ${hasInset ? `<circle cx="150" cy="150" r="200" fill="url(#frameBodyGrad)" mask="url(#frameBodyMask)" />` : ''}
</svg>`;
}

/**
 * Downloads a text content string as a file in the browser.
 */
export function triggerFileDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
