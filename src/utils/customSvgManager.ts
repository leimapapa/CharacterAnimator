import { LIMB_ORDER } from '../constants/defaultCharacter';
import { LimbId } from '../types';

export const DEFAULT_CHARACTER_SVG = `<!-- Piggy Character SVG - Rigged Template -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" id="taxesFront">
  <defs>
    <!-- Inset Shadow Radial Gradient -->
    <radialGradient id="bodyGrad">
      <stop offset="0%" stop-color="rgba(0,0,0,0)" />
      <stop offset="100%" stop-color="rgba(0,0,0,0.5)" />
    </radialGradient>

    <!-- Inset Shadow Mask: uses the pig outline to clip the vignette inside -->
    <mask id="bodyMask">
      <use href="#pig" filter="brightness(0) invert(1)" />
    </mask>

    <!-- Rigged Character Limbs -->
    <g stroke-linecap="round" stroke-linejoin="round" id="pig">
      <!-- Foot L (Left Leg) -->
      <g id="footL">
        <path d="M 151 240 v 28 a 15 3 0 0 0 49 0 v -28 a 15 3 0 0 0 -49 0" fill="pink" stroke="#123" stroke-width="2" />
        <path d="M 175 272.9 l 7 -7.9 l 18 3 c 0 3 -13 5 -25 4.9 c -11 0.1 -24 -1.9 -24 -4.9 l 17 -3 z" fill="#d99" stroke="#123" stroke-width="1" />
      </g>

      <!-- Foot R (Right Leg) -->
      <g id="footR">
        <path d="M 101 240 v 28 a 15 3 0 0 0 49 0 v -28 a 15 3 0 0 0 -49 0" fill="pink" stroke="#123" stroke-width="2" />
        <path d="M 125 272.9 l 7 -7.9 l 18 3 c 0 3 -13 5 -25 4.9 c -11 0.1 -24 -1.9 -24 -4.9 l 17 -3 z" fill="#d99" stroke="#123" stroke-width="1" />
      </g>

      <!-- Body & Belt -->
      <g id="body">
        <path d="M 150 100 a 90 75 0 1 0 0.01 0" fill="lightblue" stroke="#123" stroke-width="2" />
        <path d="M 61 178 q 89 -18 178 0" fill="none" stroke="#123" stroke-width="5" />
        <g transform="translate(-50 -5)">
          <path d="M 168 167 l 15 -14 h 51 l 8 10 v 24 l -13 16 h -44 l -17 -9 z" fill="silver" stroke="#123" stroke-width="2" />
          <path d="M 201 176 c -14 -8 -13 -26 6 -27 l 2 -8 l 5 1 l -2 8 q 2 0 6 1 l 2 -8 l 5 1 l -2 9 c 8 3 12 11 10 17 c -2 5 -11 4 -9 -4 l 1 -7 l -3 -2 l -5 20 c 21 13 11 32 -7 31 l -2 9 l -5 -2 l 2 -8 q -3 0 -5 -1 l -2 8 l -6 -2 l 2 -7 c -8 -4 -12 -10 -12 -15 c 0 -13 16 -13 12 0 l -2 6 l 4 3 z m 10 27 c 8 2 14 -11 4 -18 z m -5 -49 c -9 3 -8 11 -3 13 z" fill="gold" stroke="#123" stroke-width="2" />
        </g>
        <path d="M 150 100 a 45 14 0 1 0 0.01 0" fill="pink" stroke="#123" stroke-width="2" />
      </g>

      <!-- Head & Facial Features -->
      <g id="head">
        <path d="M 121 103 a 42 42 0 1 1 61 1 a 36 11 0 1 1 -61 -1 z" fill="pink" stroke="#123" stroke-width="2" />

        <!-- Ear L -->
        <g id="earL">
          <path d="M 173 46 l 11 0 l 6 13 z" fill="#c00" />
          <path d="M 171 38 l 19 0 l 3 25 l -15 -17 l -5 0" fill="pink" />
          <path d="M 171 38 l 19 0 l 3 25 l -15 -17" fill="none" stroke="#123" stroke-width="2" />
        </g>

        <!-- Ear R -->
        <g id="earR">
          <path d="M 119 52 l 17 -11 l -15 -2 z" fill="#c00" />
          <path d="M 136 36 l -20 -3 l -6 32 l 18 -24 l 8 1" fill="pink" />
          <path d="M 136 36 l -20 -3 l -6 32 l 18 -24" fill="none" stroke="#123" stroke-width="2" />
        </g>

        <!-- Eyes -->
        <g id="eyes">
          <path d="M 127 66 q 11 -10 23 3" fill="none" stroke="#123" stroke-width="4" />
          <path d="M 157 68 q 11 -12 23 -3" fill="none" stroke="#123" stroke-width="4" />
        </g>

        <!-- Snout -->
        <g id="snout">
          <path fill="lightpink" d="M 141 74 q 0 9 12 9 q 12 0 12 -9 q 0 -9 -12 -9 q -12 0 -12 9" />
          <path fill="pink" stroke="#123" stroke-width="2" d="M 141 77 q 0 9 12 9 q 12 0 12 -9 q 0 -9 -12 -9 q -12 0 -12 9" />
          <path fill="none" stroke="#123" stroke-linecap="round" stroke-width="4" d="M149 80 v -6 m 8 6 v -6" />
        </g>
      </g>

      <!-- Hand L (Left Arm) -->
      <g id="handL">
        <path d="M 220 160 a 18 14 0 1 1 23 0 l -6 12 l -5 -7 l -6 7 z" fill="pink" stroke="#123" stroke-width="2" />
      </g>

      <!-- Hand R (Right Arm) -->
      <g id="handR">
        <path d="M 79 170 a 18 14 0 1 1 23 0 l -6 12 l -5 -7 l -6 7 z" fill="pink" stroke="#123" stroke-width="2" />
      </g>
    </g>
  </defs>

  <!-- Character Render Instance -->
  <use href="#pig" />

  <!-- Inset Shadow Overlay (Uses mask with <use href="#pig"> to cast vignette inside character bounds) -->
  <circle cx="150" cy="150" r="200" fill="url(#bodyGrad)" mask="url(#bodyMask)" />
</svg>`;

export const DEATH_CHARACTER_SVG = `<svg xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 300 300" fill="none" stroke="none" stroke-linecap="square" stroke-miterlimit="10" id="deathFront">
	<defs>
    <!-- Inset Shadow Radial Gradient -->
    <radialGradient id="bodyGrad">
      <stop offset="0%" stop-color="rgba(0,0,0,0)" />
      <stop offset="100%" stop-color="rgba(0,0,0,0.3)" />
    </radialGradient>

    <!-- Inset Shadow Mask: uses the pig outline to clip the vignette inside -->
    <mask id="bodyMask">
      <use href="#death" filter="brightness(0) invert(1)" />
    </mask>

    <!-- Rigged Character Limbs -->
    <g stroke-linecap="round" stroke-linejoin="round" id="death">
		
		<g class="body">
			<g class="legs">
				<g class="legL">
					<path stroke="#000000" stroke-width="3" stroke-linejoin="round" stroke-linecap="butt" fill="#1e4e79" d="M 158 219 a 1 1 0 0 1 30 0 v 28 h 10 a 1 1 0 0 1 0 30 h -26 a 13 13 0 0 1 -14 -14 z" fill-rule="evenodd"/>
					<path class="legBone" fill="#ffffff" d="M 173 219 h 4 a 1 1 0 0 1 1 1 v 29 a 1 1 0 0 1 -1 1 h -4 a 1 1 0 0 1 -1 -1 v -29 a 1 1 0 0 1 1 -1 z" fill-rule="evenodd"/>
					<path class="footL" fill="#ffffff" d="M 188 250 a 1 1 0 0 0 0 23 a 1 1 0 0 0 0 -23 Z" fill-rule="evenodd"/>
				</g>
				<g class="legR">
					<path fill="#1e4e79" stroke="#000000" stroke-width="3" stroke-linejoin="round" stroke-linecap="butt" d="M 112 247 v -28 a 1 1 0 0 1 30 0 v 44 a 13 13 0 0 1 -14 14 h -26 a 1 1 0 0 1 1 -30 Z" fill-rule="evenodd"/>
					<path class="legBone" fill="#ffffff" d="M 123 219 h 4 a 1 1 0 0 1 1 1 v 29 a 1 1 0 0 1 -1 1 h -4 a 1 1 0 0 1 -1 -1 v -29 a 1 1 0 0 1 1 -1 z" fill-rule="evenodd"/>
					<path class="footR" fill="#ffffff" d="M 112 250 a 1 1 0 0 0 0 23 a 1 1 0 0 0 0 -23 z" fill-rule="evenodd"/>
				</g>
			</g>
			<path class="body" stroke="#000000" stroke-width="3" stroke-linejoin="round" stroke-linecap="butt" fill="#1e4e79" d="M 120 134 a 1 1 0 0 1 60 0 v 40 a 1 1 0 0 1 -60 0 z" fill-rule="evenodd"/>
			<path class="spine" fill="#ffffff" d="M 148 109 h 4 a 1 1 0 0 1 1 1 v 48 a 1 1 0 0 1 -1 1 h -4 a 1 1 0 0 1 -1 -1 v -48 a 1 1 0 0 1 1 -1 Z" fill-rule="evenodd"/>
			<g class="ribs">
				<path class="rib" fill="#ffffff" d="M 157 131 h 20 a 1 1 0 0 1 1 1 v 3 a 1 1 0 0 1 -1 1 h -20 a 1 1 0 0 1 -1 -1 v -3 a 1 1 0 0 1 1 -1 Z M 157 141 h 20 a 1 1 0 0 1 1 1 v 3 a 1 1 0 0 1 -1 1 h -20 a 1 1 0 0 1 -1 -1 v -3 a 1 1 0 0 1 1 -1 Z M 157 151 h 20 a 1 1 0 0 1 1 1 v 3 a 1 1 0 0 1 -1 1 h -20 a 1 1 0 0 1 -1 -1 v -3 a 1 1 0 0 1 1 -1 Z M 123 131 h 20 a 1 1 0 0 1 1 1 v 3 a 1 1 0 0 1 -1 1 h -20 a 1 1 0 0 1 -1 -1 v -3 a 1 1 0 0 1 1 -1 Z M 123 141 h 20 a 1 1 0 0 1 1 1 v 3 a 1 1 0 0 1 -1 1 h -20 a 1 1 0 0 1 -1 -1 v -3 a 1 1 0 0 1 1 -1 Z M 123 151 h 20 a 1 1 0 0 1 1 1 v 3 a 1 1 0 0 1 -1 1 h -20 a 1 1 0 0 1 -1 -1 v -3 a 1 1 0 0 1 1 -1 Z" fill-rule="evenodd"/>
			</g>
			<path class="pelvis" fill="#ffffff" d="M 139.3 179 c -2.8 0 -5.05 1.3 -5.05 2.85 c 0 1.2 1.25 2.2 3.1 2.65 l 0.35 0.05 l 3.25 0 l 0.35 -0.05 c 1.8 -0.45 3.1 -1.45 3.1 -2.65 c 0 -1.6 -2.25 -2.85 -5.05 -2.85 z m 21.35 -0.1 c -2.8 0 -5.05 1.3 -5.05 2.85 c 0 1.2 1.25 2.2 3.1 2.65 l 1.4 0.15 l 1.15 0 l 1.4 -0.15 c 1.8 -0.45 3.1 -1.45 3.1 -2.65 c 0 -1.6 -2.25 -2.85 -5.05 -2.85 z m -20.8 -14.6 c 3.55 0 6.8 1.45 9.15 3.8 l 1 1.45 l 1 -1.45 c 2.35 -2.35 5.55 -3.8 9.15 -3.8 c 7.15 0 12.9 5.8 12.9 12.9 c 0 1.8 -0.35 3.5 -1 5.05 l -1.55 2.3 l 0.2 0 l -1.3 1.65 l -0.1 0.15 l -0.05 0.05 l -5.55 7.1 l -0.5 0 l -0.05 0.05 c -1.25 0.95 -6.65 1.65 -13.15 1.65 c -6.5 0 -11.9 -0.7 -13.15 -1.65 l -0.05 -0.05 l -0.45 0 l -5.55 -7.1 l -0.05 -0.05 l -0.1 -0.15 l -1.3 -1.65 l 0.2 0 l -1.55 -2.3 c -0.65 -1.55 -1 -3.25 -1 -5.05 c 0 -7.15 5.8 -12.9 12.9 -12.9 Z" fill-rule="evenodd"/>
		</g>
	
		<g class="head">
			<path class="headBase" stroke="#000000" stroke-width="3" stroke-linejoin="round" stroke-linecap="butt" fill="#1e4e79" d="M 134 100 l -6 -10 a 38 38 0 1 1 44 0 l -6 10 z" fill-rule="evenodd"/>
			<path class="skull" fill="#ffffff" d="M 135 90 l -7 -9 a 32 32 0 1 1 44 0 l -7 9 h -6 v -7 h -2 v 7 h -6 v -7 h -2 v 7 h -6 v -7 h -2 v 7 z m 15 -20 l -4 7 h 8 z m -13 -20 a 1 1 0 0 0 0 21 a 1 1 0 0 0 0 -21 z m 26 0 a 1 1 0 0 0 0 21 a 1 1 0 0 0 0 -21 z" fill-rule="evenodd"/>
			<path class="jawbone" fill="#ffffff" d="M 134 92 h 27 a 1 1 0 0 1 1 1 v 4 a 1 1 0 0 1 -1 1 h -27 a 1 1 0 0 1 -1 -1 v -4 a 1 1 0 0 1 1 -1 Z" fill-rule="evenodd"/>
			<g class="eyes">
				<path class="eyeR" stroke="#1e4e79" stroke-width="1" stroke-miterlimit="4" stroke-linecap="butt" fill="#ffffff" d="M 134 66 v -7 h 7 v 7 Z" fill-rule="evenodd"/>
				<path class="eyeL" stroke="#1e4e79" stroke-width="1" stroke-miterlimit="4" stroke-linecap="butt" fill="#ffffff" d="M 159 66 v -7 h 7 v 7 Z" fill-rule="evenodd"/>
			</g>
		</g>
	
		<g class="armR">
			<path stroke="#000000" stroke-width="3" stroke-linejoin="round" stroke-linecap="butt" fill="#1e4e79" d="M 100 120 a 1 1 0 0 1 24 0 v 43 a 17 17 0 1 1 -24 0 z" fill-rule="evenodd"/>
			<path class="armBone" fill="#ffffff" d="M 110 124 h 4 a 1 1 0 0 1 1 1 v 35 a 1 1 0 0 1 -1 1 h -4 a 1 1 0 0 1 -1 -1 v -35 a 1 1 0 0 1 1 -1 z" fill-rule="evenodd"/>
			<path class="handR" fill="#ffffff" d="M 112 165 a 1 1 0 0 0 0 21 a 1 1 0 0 0 0 -21 z" fill-rule="evenodd"/>
		</g>
		
		<g class="armL">
			<path stroke="#000000" stroke-width="3" stroke-linejoin="round" stroke-linecap="butt" fill="#1e4e79" d="M 175 120 a 1 1 0 0 1 24 0 v 43 a 17 17 0 1 1 -24 0 z" fill-rule="evenodd"/>
			<path class="armBone" fill="#ffffff" d="M 185 124 h 4 a 1 1 0 0 1 1 1 v 35 a 1 1 0 0 1 -1 1 h -4 a 1 1 0 0 1 -1 -1 v -35 a 1 1 0 0 1 1 -1 z" fill-rule="evenodd"/>
			<path class="handL" fill="#ffffff" d="M 187 165 a 1 1 0 0 0 0 21 a 1 1 0 0 0 0 -21 z" fill-rule="evenodd"/>
		</g>
		
		</g>
		</defs>

  <!-- Character Render Instance -->
  <use href="#death" />

  <!-- Inset Shadow Overlay (Uses mask with <use href="#pig"> to cast vignette inside character bounds) -->
  <circle cx="150" cy="150" r="200" fill="url(#bodyGrad)" mask="url(#bodyMask)" />
</svg>`;

export const DEATH_PIVOTS: LimbPivots = {
  body: { x: 150, y: 165 },
  head: { x: 150, y: 100 },
  handL: { x: 187, y: 120 },
  handR: { x: 112, y: 120 },
  footL: { x: 173, y: 219 },
  footR: { x: 127, y: 219 },
  eyes: { x: 150, y: 63 },
  earL: { x: 175, y: 55 },
  earR: { x: 125, y: 55 },
  snout: { x: 150, y: 80 },
};

export const DEATH_REST_POSE: PuppetPose = {
  body: { rotation: 0, x: 0, y: 0, scaleX: 1, scaleY: 1 },
  head: { rotation: 0, x: 0, y: 0, scaleX: 1, scaleY: 1 },
  handL: { rotation: 0, x: 0, y: 0, scaleX: 1, scaleY: 1 },
  handR: { rotation: 0, x: 0, y: 0, scaleX: 1, scaleY: 1 },
  footL: { rotation: 0, x: 0, y: 0, scaleX: 1, scaleY: 1 },
  footR: { rotation: 0, x: 0, y: 0, scaleX: 1, scaleY: 1 },
  earL: { rotation: 0, x: 0, y: 0, scaleX: 1, scaleY: 1 },
  earR: { rotation: 0, x: 0, y: 0, scaleX: 1, scaleY: 1 },
  snout: { rotation: 0, x: 0, y: 0, scaleX: 1, scaleY: 1 },
  eyes: { rotation: 0, x: 0, y: 0, scaleX: 1, scaleY: 1 },
};

export interface ParsedCharacterSvg {
  rawSvg: string;
  defsInnerHtml: string;
  limbMarkup: Record<LimbId, string>;
  hasInsetShadow: boolean;
  insetShadowColorStop?: string;
  characterType?: 'piggy' | 'death' | 'custom';
}

const STORAGE_KEY = 'piggymotion_custom_svg_v1';
const CHARACTER_TYPE_KEY = 'piggymotion_character_type_v1';

export function getSavedCharacterType(): 'piggy' | 'death' {
  try {
    const saved = localStorage.getItem(CHARACTER_TYPE_KEY);
    if (saved === 'death' || saved === 'piggy') return saved;
  } catch (e) {}
  return 'piggy';
}

export function saveCurrentCharacterType(type: 'piggy' | 'death') {
  try {
    localStorage.setItem(CHARACTER_TYPE_KEY, type);
  } catch (e) {}
}

export function getCharacterSvgByType(characterType: 'piggy' | 'death'): string {
  return characterType === 'death' ? DEATH_CHARACTER_SVG : DEFAULT_CHARACTER_SVG;
}

export function loadCharacterSvgByType(characterType: 'piggy' | 'death'): ParsedCharacterSvg {
  const svg = getCharacterSvgByType(characterType);
  const res = parseCharacterSvg(svg);
  return res.parsed!;
}

/**
 * Parses an SVG string, validating XML syntax and extracting limb contents and inset shadow settings.
 */
export function parseCharacterSvg(svgString: string): {
  success: boolean;
  parsed?: ParsedCharacterSvg;
  error?: string;
} {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const parserError = doc.querySelector('parsererror');

    if (parserError) {
      return {
        success: false,
        error: parserError.textContent || 'XML syntax error in SVG markup.',
      };
    }

    const svgEl = doc.querySelector('svg');
    if (!svgEl) {
      return {
        success: false,
        error: 'No root <svg> element found in code.',
      };
    }

    const isDeath =
      svgString.includes('id="deathFront"') ||
      svgString.includes('id="death"') ||
      svgString.includes('class="skull"');

    // Extract defs inner markup
    const defsEl = svgEl.querySelector('defs');
    let defsInnerHtml = '';
    if (defsEl) {
      // Collect gradients, filters, masks, etc.
      defsInnerHtml = defsEl.innerHTML;
    }

    // Check whether the inset shadow circle exists outside defs
    const circleOverlay = svgEl.querySelector('circle[mask*="bodyMask"], circle[fill*="bodyGrad"], [data-inset-shadow="true"]');
    const bodyMaskEl = defsEl?.querySelector('mask#bodyMask');
    const hasUseInMask = bodyMaskEl ? bodyMaskEl.querySelector('use[href*="pig"], use[href*="death"]') !== null : false;

    const hasInsetShadow = Boolean(circleOverlay) && (hasUseInMask || Boolean(bodyMaskEl));

    // Extract stop color if custom
    let insetShadowColorStop = 'rgba(0,0,0,0.5)';
    const radGrad = defsEl?.querySelector('radialGradient#bodyGrad');
    if (radGrad) {
      const stops = radGrad.querySelectorAll('stop');
      if (stops.length > 1) {
        const lastStop = stops[stops.length - 1];
        insetShadowColorStop = lastStop.getAttribute('stop-color') || lastStop.getAttribute('stopColor') || 'rgba(0,0,0,0.5)';
      }
    }

    // Extract each limb markup with rich multi-character selector support
    const limbMarkup: Record<LimbId, string> = {} as any;

    const limbSelectors: Record<LimbId, string> = {
      body: 'g.body, #body, g[id="body"], [data-limb="body"]',
      head: 'g.head, #head, g[id="head"], [data-limb="head"]',
      handL: '.armL, g.armL, #handL, g[id="handL"], [data-limb="handL"], .handL',
      handR: '.armR, g.armR, #handR, g[id="handR"], [data-limb="handR"], .handR',
      footL: '.legL, g.legL, #footL, g[id="footL"], [data-limb="footL"], .footL',
      footR: '.legR, g.legR, #footR, g[id="footR"], [data-limb="footR"], .footR',
      eyes: 'g.eyes, #eyes, g[id="eyes"], [data-limb="eyes"], .eyes',
      earL: 'g.earL, #earL, g[id="earL"], [data-limb="earL"], .earL',
      earR: 'g.earR, #earR, g[id="earR"], [data-limb="earR"], .earR',
      snout: 'g.snout, #snout, g[id="snout"], [data-limb="snout"], .snout',
    };

    LIMB_ORDER.forEach((limbId) => {
      const limbEl = svgEl.querySelector(limbSelectors[limbId]);

      if (limbEl) {
        if (limbId === 'head') {
          // Clone head to exclude child nested limbs so they animate independently
          const clone = limbEl.cloneNode(true) as Element;
          ['earL', 'earR', 'eyes', 'snout'].forEach((childId) => {
            const childEl = clone.querySelector(`#${childId}, .${childId}, g.${childId}, [data-limb="${childId}"]`);
            if (childEl) childEl.remove();
          });
          limbMarkup[limbId] = clone.innerHTML.trim();
        } else if (limbId === 'body') {
          // Clone body to exclude nested legs (as in death SVG where legs are declared inside body group)
          const clone = limbEl.cloneNode(true) as Element;
          const nestedLegs = clone.querySelectorAll('.legs, .legL, .legR, #footL, #footR, g.legs, g.legL, g.legR');
          nestedLegs.forEach((el) => el.remove());
          limbMarkup[limbId] = clone.innerHTML.trim();
        } else {
          limbMarkup[limbId] = limbEl.innerHTML.trim();
        }
      } else {
        // If not found in SVG:
        // Skeletons have no ears and no pig snout -> cleanly empty string
        if (isDeath && (limbId === 'earL' || limbId === 'earR' || limbId === 'snout')) {
          limbMarkup[limbId] = '';
        } else {
          limbMarkup[limbId] = getDefaultLimbMarkup(limbId);
        }
      }
    });

    return {
      success: true,
      parsed: {
        rawSvg: svgString,
        defsInnerHtml,
        limbMarkup,
        hasInsetShadow,
        insetShadowColorStop,
        characterType: isDeath ? 'death' : svgString.includes('id="pig"') ? 'piggy' : 'custom',
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to parse SVG code.',
    };
  }
}

/**
 * Returns default markup for a given limb if not present in user SVG.
 */
export function getDefaultLimbMarkup(limbId: LimbId): string {
  switch (limbId) {
    case 'footL':
      return `<path d="M 151 240 v 28 a 15 3 0 0 0 49 0 v -28 a 15 3 0 0 0 -49 0" fill="pink" stroke="#123" stroke-width="2" />
<path d="M 175 272.9 l 7 -7.9 l 18 3 c 0 3 -13 5 -25 4.9 c -11 0.1 -24 -1.9 -24 -4.9 l 17 -3 z" fill="#d99" stroke="#123" stroke-width="1" />`;
    case 'footR':
      return `<path d="M 101 240 v 28 a 15 3 0 0 0 49 0 v -28 a 15 3 0 0 0 -49 0" fill="pink" stroke="#123" stroke-width="2" />
<path d="M 125 272.9 l 7 -7.9 l 18 3 c 0 3 -13 5 -25 4.9 c -11 0.1 -24 -1.9 -24 -4.9 l 17 -3 z" fill="#d99" stroke="#123" stroke-width="1" />`;
    case 'body':
      return `<path d="M 150 100 a 90 75 0 1 0 0.01 0" fill="lightblue" stroke="#123" stroke-width="2" />
<path d="M 61 178 q 89 -18 178 0" fill="none" stroke="#123" stroke-width="5" />
<g transform="translate(-50 -5)">
  <path d="M 168 167 l 15 -14 h 51 l 8 10 v 24 l -13 16 h -44 l -17 -9 z" fill="silver" stroke="#123" stroke-width="2" />
  <path d="M 201 176 c -14 -8 -13 -26 6 -27 l 2 -8 l 5 1 l -2 8 q 2 0 6 1 l 2 -8 l 5 1 l -2 9 c 8 3 12 11 10 17 c -2 5 -11 4 -9 -4 l 1 -7 l -3 -2 l -5 20 c 21 13 11 32 -7 31 l -2 9 l -5 -2 l 2 -8 q -3 0 -5 -1 l -2 8 l -6 -2 l 2 -7 c -8 -4 -12 -10 -12 -15 c 0 -13 16 -13 12 0 l -2 6 l 4 3 z m 10 27 c 8 2 14 -11 4 -18 z m -5 -49 c -9 3 -8 11 -3 13 z" fill="gold" stroke="#123" stroke-width="2" />
</g>
<path d="M 150 100 a 45 14 0 1 0 0.01 0" fill="pink" stroke="#123" stroke-width="2" />`;
    case 'head':
      return `<path d="M 121 103 a 42 42 0 1 1 61 1 a 36 11 0 1 1 -61 -1 z" fill="pink" stroke="#123" stroke-width="2" />`;
    case 'earL':
      return `<path d="M 173 46 l 11 0 l 6 13 z" fill="#c00" />
<path d="M 171 38 l 19 0 l 3 25 l -15 -17 l -5 0" fill="pink" />
<path d="M 171 38 l 19 0 l 3 25 l -15 -17" fill="none" stroke="#123" stroke-width="2" />`;
    case 'earR':
      return `<path d="M 119 52 l 17 -11 l -15 -2 z" fill="#c00" />
<path d="M 136 36 l -20 -3 l -6 32 l 18 -24 l 8 1" fill="pink" />
<path d="M 136 36 l -20 -3 l -6 32 l 18 -24" fill="none" stroke="#123" stroke-width="2" />`;
    case 'eyes':
      return `<path d="M 127 66 q 11 -10 23 3" fill="none" stroke="#123" stroke-width="4" />
<path d="M 157 68 q 11 -12 23 -3" fill="none" stroke="#123" stroke-width="4" />`;
    case 'snout':
      return `<path fill="lightpink" d="M 141 74 q 0 9 12 9 q 12 0 12 -9 q 0 -9 -12 -9 q -12 0 -12 9" />
<path fill="pink" stroke="#123" stroke-width="2" d="M 141 77 q 0 9 12 9 q 12 0 12 -9 q 0 -9 -12 -9 q -12 0 -12 9" />
<path fill="none" stroke="#123" stroke-linecap="round" stroke-width="4" d="M149 80 v -6 m 8 6 v -6" />`;
    case 'handL':
      return `<path d="M 220 160 a 18 14 0 1 1 23 0 l -6 12 l -5 -7 l -6 7 z" fill="pink" stroke="#123" stroke-width="2" />`;
    case 'handR':
      return `<path d="M 79 170 a 18 14 0 1 1 23 0 l -6 12 l -5 -7 l -6 7 z" fill="pink" stroke="#123" stroke-width="2" />`;
    default:
      return '';
  }
}

/**
 * Loads custom SVG from local storage or returns the default.
 */
export function loadSavedCharacterSvg(): ParsedCharacterSvg {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const res = parseCharacterSvg(saved);
      if (res.success && res.parsed) {
        return res.parsed;
      }
    }
  } catch (e) {
    console.warn('Could not read saved SVG from localStorage:', e);
  }

  const defaultRes = parseCharacterSvg(DEFAULT_CHARACTER_SVG);
  return defaultRes.parsed!;
}

/**
 * Persists custom SVG code to local storage.
 */
export function saveCharacterSvg(svgString: string): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, svgString);
    return true;
  } catch (e) {
    console.warn('Could not save SVG to localStorage:', e);
    return false;
  }
}

/**
 * Resets local storage to default character SVG.
 */
export function resetCharacterSvg(): ParsedCharacterSvg {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {}
  const defaultRes = parseCharacterSvg(DEFAULT_CHARACTER_SVG);
  return defaultRes.parsed!;
}

/**
 * Inset Shadow Helper: toggles the presence of the inset shadow elements in the raw SVG string.
 */
export function toggleInsetShadowInSvgCode(svgCode: string, enable: boolean): string {
  if (!enable) {
    // Remove the <circle cx="150" cy="150" r="200" fill="url(#bodyGrad)" mask="url(#bodyMask)" />
    let updated = svgCode.replace(
      /\s*<!-- Inset Shadow Overlay[\s\S]*?-->\s*<circle[^>]*mask=["']url\(#bodyMask\)["'][^>]*\/>/gi,
      ''
    );
    // Also match standalone circle if comment wasn't there
    updated = updated.replace(
      /\s*<circle[^>]*mask=["']url\(#bodyMask\)["'][^>]*\/>/gi,
      ''
    );
    return updated;
  } else {
    // If not already present, insert it before the closing </svg> tag
    if (!svgCode.includes('mask="url(#bodyMask)"') && !svgCode.includes("mask='url(#bodyMask)'")) {
      const circleTag = `\n  <!-- Inset Shadow Overlay (Uses mask with <use href="#pig"> to cast vignette inside character bounds) -->\n  <circle cx="150" cy="150" r="200" fill="url(#bodyGrad)" mask="url(#bodyMask)" />\n`;
      return svgCode.replace(/<\/svg>/i, `${circleTag}</svg>`);
    }
    return svgCode;
  }
}
