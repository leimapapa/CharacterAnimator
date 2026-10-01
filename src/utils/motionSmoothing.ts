import { KeyframePoint, LimbPose } from '../types';

/**
 * Interpolates a limb pose at time t from a list of keyframe points.
 * Handles loop wrap-around seamlessly.
 */
export function interpolatePoseAtTime(
  keyframes: KeyframePoint[],
  time: number,
  duration: number,
  defaultPose: LimbPose
): LimbPose {
  if (!keyframes || keyframes.length === 0) {
    return { ...defaultPose };
  }

  // Normalize time to [0, duration]
  const wrappedTime = duration > 0 ? ((time % duration) + duration) % duration : 0;

  if (keyframes.length === 1) {
    return { ...keyframes[0].pose };
  }

  // Find surrounding keyframes
  let prevIdx = -1;
  let nextIdx = -1;

  for (let i = 0; i < keyframes.length; i++) {
    if (keyframes[i].time <= wrappedTime) {
      prevIdx = i;
    } else {
      nextIdx = i;
      break;
    }
  }

  // Boundary cases
  if (prevIdx === -1) {
    // Before first keyframe
    const first = keyframes[0];
    const last = keyframes[keyframes.length - 1];
    const segmentDuration = duration - last.time + first.time;
    if (segmentDuration <= 0) return { ...first.pose };
    const dt = wrappedTime + (duration - last.time);
    const alpha = Math.min(1, Math.max(0, dt / segmentDuration));
    return lerpPose(last.pose, first.pose, alpha);
  }

  if (nextIdx === -1) {
    // After last keyframe, wrap to first
    const first = keyframes[0];
    const last = keyframes[prevIdx];
    const segmentDuration = duration - last.time + first.time;
    if (segmentDuration <= 0) return { ...last.pose };
    const dt = wrappedTime - last.time;
    const alpha = Math.min(1, Math.max(0, dt / segmentDuration));
    return lerpPose(last.pose, first.pose, alpha);
  }

  const kPrev = keyframes[prevIdx];
  const kNext = keyframes[nextIdx];
  const dt = kNext.time - kPrev.time;
  const alpha = dt > 0 ? (wrappedTime - kPrev.time) / dt : 0;

  return lerpPose(kPrev.pose, kNext.pose, easeInOutSine(alpha));
}

function easeInOutSine(x: number): number {
  return -(Math.cos(Math.PI * x) - 1) / 2;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerpPose(a: LimbPose, b: LimbPose, t: number): LimbPose {
  return {
    rotation: lerp(a.rotation, b.rotation, t),
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    scaleX: lerp(a.scaleX ?? 1, b.scaleX ?? 1, t),
    scaleY: lerp(a.scaleY ?? 1, b.scaleY ?? 1, t),
  };
}

/**
 * Applies moving-average window smoothing to a list of recorded keyframes.
 */
export function smoothKeyframes(
  keyframes: KeyframePoint[],
  windowRadius = 3
): KeyframePoint[] {
  if (keyframes.length <= windowRadius * 2) return [...keyframes];

  const result: KeyframePoint[] = [];

  for (let i = 0; i < keyframes.length; i++) {
    let rotSum = 0;
    let xSum = 0;
    let ySum = 0;
    let sxSum = 0;
    let sySum = 0;
    let weightSum = 0;

    for (let offset = -windowRadius; offset <= windowRadius; offset++) {
      const idx = i + offset;
      if (idx >= 0 && idx < keyframes.length) {
        // Gaussian weight
        const w = Math.exp(-(offset * offset) / (2 * (windowRadius / 2) ** 2));
        const p = keyframes[idx].pose;
        rotSum += p.rotation * w;
        xSum += p.x * w;
        ySum += p.y * w;
        sxSum += (p.scaleX ?? 1) * w;
        sySum += (p.scaleY ?? 1) * w;
        weightSum += w;
      }
    }

    result.push({
      time: keyframes[i].time,
      pose: {
        rotation: rotSum / weightSum,
        x: xSum / weightSum,
        y: ySum / weightSum,
        scaleX: sxSum / weightSum,
        scaleY: sySum / weightSum,
      },
    });
  }

  return result;
}

/**
 * Quantizes and subsamples keyframes to maintain clean storage while retaining smoothness.
 */
export function cleanKeyframeTrack(
  keyframes: KeyframePoint[],
  epsilon = 0.2
): KeyframePoint[] {
  if (keyframes.length < 3) return keyframes;
  const filtered: KeyframePoint[] = [keyframes[0]];

  for (let i = 1; i < keyframes.length - 1; i++) {
    const prev = filtered[filtered.length - 1];
    const curr = keyframes[i];
    const next = keyframes[i + 1];

    // Check if current is substantially different from line between prev and next
    const dt = next.time - prev.time;
    const alpha = dt > 0 ? (curr.time - prev.time) / dt : 0.5;
    const estRot = lerp(prev.pose.rotation, next.pose.rotation, alpha);
    const estX = lerp(prev.pose.x, next.pose.x, alpha);
    const estY = lerp(prev.pose.y, next.pose.y, alpha);

    const diff =
      Math.abs(curr.pose.rotation - estRot) +
      Math.abs(curr.pose.x - estX) +
      Math.abs(curr.pose.y - estY);

    if (diff > epsilon || curr.time - prev.time > 0.15) {
      filtered.push(curr);
    }
  }

  filtered.push(keyframes[keyframes.length - 1]);
  return filtered;
}
