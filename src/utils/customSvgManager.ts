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

export interface ParsedCharacterSvg {
  rawSvg: string;
  defsInnerHtml: string;
  limbMarkup: Record<LimbId, string>;
  hasInsetShadow: boolean;
  insetShadowColorStop?: string;
}

const STORAGE_KEY = 'piggymotion_custom_svg_v1';

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

    // Extract defs inner markup
    const defsEl = svgEl.querySelector('defs');
    let defsInnerHtml = '';
    if (defsEl) {
      // Collect gradients, filters, masks, etc.
      defsInnerHtml = defsEl.innerHTML;
    }

    // Check whether the inset shadow circle exists outside defs
    // Matches <circle ... mask="url(#bodyMask)" ...> or similar mask referencing bodyMask or bodyGrad
    const circleOverlay = svgEl.querySelector('circle[mask*="bodyMask"], circle[fill*="bodyGrad"], [data-inset-shadow="true"]');
    // Also check if mask id="bodyMask" has <use href="#pig" ...>
    const bodyMaskEl = defsEl?.querySelector('mask#bodyMask');
    const hasUseInMask = bodyMaskEl ? bodyMaskEl.querySelector('use[href*="pig"]') !== null : false;

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

    // Extract each limb markup
    const limbMarkup: Record<LimbId, string> = {} as any;

    LIMB_ORDER.forEach((limbId) => {
      // Find element with id equal to limbId, or data-limb, or class
      const limbEl = svgEl.querySelector(
        `#${limbId}, [data-limb="${limbId}"], .anim-${limbId}, g[id="${limbId}"]`
      );

      if (limbEl) {
        if (limbId === 'head') {
          // Clone head to exclude child nested limbs (earL, earR, eyes, snout) so they animate independently
          const clone = limbEl.cloneNode(true) as Element;
          ['earL', 'earR', 'eyes', 'snout'].forEach((childId) => {
            const childEl = clone.querySelector(`#${childId}, [data-limb="${childId}"], .anim-${childId}`);
            if (childEl) childEl.remove();
          });
          limbMarkup[limbId] = clone.innerHTML.trim();
        } else {
          limbMarkup[limbId] = limbEl.innerHTML.trim();
        }
      } else {
        // Fallback default
        limbMarkup[limbId] = getDefaultLimbMarkup(limbId);
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
