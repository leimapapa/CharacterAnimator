import { DEFAULT_REST_POSE } from '../constants/defaultCharacter';
import { KeyframePoint, LimbId, PresetAnimation } from '../types';

function generateTrackKeyframes(
  duration: number,
  fps: number,
  fn: (t: number) => { rotation?: number; x?: number; y?: number; scaleX?: number; scaleY?: number }
): KeyframePoint[] {
  const points: KeyframePoint[] = [];
  const step = 1 / fps;
  for (let t = 0; t <= duration; t += step) {
    const normT = (t / duration) * Math.PI * 2; // complete loop 0 to 2PI
    const sample = fn(normT);
    points.push({
      time: parseFloat(t.toFixed(3)),
      pose: {
        rotation: sample.rotation ?? 0,
        x: sample.x ?? 0,
        y: sample.y ?? 0,
        scaleX: sample.scaleX ?? 1,
        scaleY: sample.scaleY ?? 1,
      },
    });
  }
  return points;
}

export const PRESET_ANIMATIONS: PresetAnimation[] = [
  {
    id: 'groove_dance',
    name: 'Piggy Groove Dance',
    description: 'Bouncy funk groove with hip sway, synchronized hand pumps, and happy ear bobbing.',
    category: 'Full Performance',
    duration: 4.0,
    tracks: {
      body: generateTrackKeyframes(4.0, 30, (t) => ({
        rotation: Math.sin(t * 2) * 12,
        y: -Math.abs(Math.sin(t * 4)) * 16,
        x: Math.cos(t * 2) * 8,
        scaleX: 1 + Math.sin(t * 4) * 0.08,
        scaleY: 1 - Math.sin(t * 4) * 0.08,
      })),
      head: generateTrackKeyframes(4.0, 30, (t) => ({
        rotation: -Math.sin(t * 2) * 15,
        y: Math.sin(t * 4) * 6,
        x: -Math.cos(t * 2) * 4,
      })),
      handL: generateTrackKeyframes(4.0, 30, (t) => ({
        rotation: -90 + Math.sin(t * 2) * 45,
        y: Math.sin(t * 4) * 10,
      })),
      handR: generateTrackKeyframes(4.0, 30, (t) => ({
        rotation: Math.cos(t * 2) * 45,
        y: Math.sin(t * 4 + Math.PI) * 10,
      })),
      footL: generateTrackKeyframes(4.0, 30, (t) => ({
        rotation: -10 + Math.max(0, Math.sin(t * 2)) * 25,
        y: -Math.max(0, Math.sin(t * 2)) * 14,
      })),
      footR: generateTrackKeyframes(4.0, 30, (t) => ({
        rotation: 10 - Math.max(0, -Math.sin(t * 2)) * 25,
        y: -Math.max(0, -Math.sin(t * 2)) * 14,
      })),
      earL: generateTrackKeyframes(4.0, 30, (t) => ({
        rotation: Math.sin(t * 4) * 20,
      })),
      earR: generateTrackKeyframes(4.0, 30, (t) => ({
        rotation: -Math.sin(t * 4) * 20,
      })),
      snout: generateTrackKeyframes(4.0, 30, (t) => ({
        scaleX: 1 + Math.sin(t * 4) * 0.15,
        scaleY: 1 + Math.sin(t * 4) * 0.15,
        y: Math.sin(t * 4) * 4,
      })),
    },
  },
  {
    id: 'enthusiastic_wave',
    name: 'Friendly Wave & Greet',
    description: 'Energetic right hand waving with friendly head tilts and welcoming body posture.',
    category: 'Greeting',
    duration: 3.0,
    tracks: {
      body: generateTrackKeyframes(3.0, 30, (t) => ({
        rotation: Math.sin(t) * 4,
        y: Math.sin(t * 2) * 4,
      })),
      head: generateTrackKeyframes(3.0, 30, (t) => ({
        rotation: 10 + Math.sin(t * 2) * 8,
        y: Math.cos(t * 2) * 3,
      })),
      handR: generateTrackKeyframes(3.0, 30, (t) => ({
        rotation: 65 + Math.sin(t * 6) * 45,
        y: -15 + Math.cos(t * 6) * 5,
        x: -5,
      })),
      handL: generateTrackKeyframes(3.0, 30, (t) => ({
        rotation: -90 + Math.sin(t) * 10,
      })),
      earL: generateTrackKeyframes(3.0, 30, (t) => ({
        rotation: Math.sin(t * 6) * 12,
      })),
      earR: generateTrackKeyframes(3.0, 30, (t) => ({
        rotation: Math.cos(t * 6) * 12,
      })),
      snout: generateTrackKeyframes(3.0, 30, (t) => ({
        scaleX: 1.1 + Math.sin(t * 2) * 0.08,
        scaleY: 1.1 + Math.sin(t * 2) * 0.08,
      })),
    },
  },
  {
    id: 'belly_laugh',
    name: 'Belly Laugh & Snort',
    description: 'Chuckle and hearty pig belly laugh with rhythmic squash-stretch and snout snorting.',
    category: 'Expressive',
    duration: 2.5,
    tracks: {
      body: generateTrackKeyframes(2.5, 30, (t) => ({
        y: Math.sin(t * 6) * 8,
        scaleX: 1 + Math.sin(t * 6) * 0.12,
        scaleY: 1 - Math.sin(t * 6) * 0.1,
      })),
      head: generateTrackKeyframes(2.5, 30, (t) => ({
        rotation: -12 + Math.sin(t * 6) * 8,
        y: -5 + Math.sin(t * 6) * 6,
      })),
      handL: generateTrackKeyframes(2.5, 30, (t) => ({
        rotation: -60 + Math.sin(t * 6) * 20,
        x: -8,
      })),
      handR: generateTrackKeyframes(2.5, 30, (t) => ({
        rotation: 30 - Math.sin(t * 6) * 20,
        x: 8,
      })),
      snout: generateTrackKeyframes(2.5, 30, (t) => ({
        scaleX: 1.25 + Math.sin(t * 6) * 0.25,
        scaleY: 1.2 + Math.sin(t * 6) * 0.2,
        y: Math.sin(t * 6) * 6,
      })),
      earL: generateTrackKeyframes(2.5, 30, (t) => ({
        rotation: Math.sin(t * 6) * 25,
      })),
      earR: generateTrackKeyframes(2.5, 30, (t) => ({
        rotation: -Math.sin(t * 6) * 25,
      })),
    },
  },
  {
    id: 'idle_breathe',
    name: 'Gentle Idle Breathing',
    description: 'Subtle, natural resting loop with gentle breathing cadence and ear twitches.',
    category: 'Subtle Loop',
    duration: 4.0,
    tracks: {
      body: generateTrackKeyframes(4.0, 30, (t) => ({
        scaleX: 1 + Math.sin(t) * 0.03,
        scaleY: 1 + Math.sin(t) * 0.04,
        y: -Math.sin(t) * 3,
      })),
      head: generateTrackKeyframes(4.0, 30, (t) => ({
        y: -Math.sin(t) * 2.5,
        rotation: Math.sin(t * 0.5) * 2,
      })),
      handL: generateTrackKeyframes(4.0, 30, (t) => ({
        rotation: -90 + Math.sin(t) * 4,
      })),
      handR: generateTrackKeyframes(4.0, 30, (t) => ({
        rotation: Math.sin(t) * 4,
      })),
      earL: generateTrackKeyframes(4.0, 30, (t) => ({
        rotation: Math.pow(Math.sin(t * 2), 7) * 15,
      })),
      earR: generateTrackKeyframes(4.0, 30, (t) => ({
        rotation: -Math.pow(Math.cos(t * 2), 7) * 15,
      })),
      snout: generateTrackKeyframes(4.0, 30, (t) => ({
        scaleX: 1 + Math.sin(t * 3) * 0.05,
        scaleY: 1 + Math.sin(t * 3) * 0.05,
      })),
    },
  },
  {
    id: 'tiptoe_sneak',
    name: 'Sneaky Tiptoe Walk',
    description: 'Suspicious stealth walk with alternating foot lifts and nervous side-to-side head glances.',
    category: 'Walk Cycle',
    duration: 3.2,
    tracks: {
      body: generateTrackKeyframes(3.2, 30, (t) => ({
        rotation: Math.sin(t) * 6,
        y: -Math.abs(Math.sin(t * 2)) * 10,
        x: Math.sin(t) * 5,
      })),
      head: generateTrackKeyframes(3.2, 30, (t) => ({
        rotation: Math.sin(t) * 20,
        x: Math.sin(t) * 8,
      })),
      footL: generateTrackKeyframes(3.2, 30, (t) => ({
        rotation: -10 + Math.max(0, Math.sin(t)) * 30,
        y: -Math.max(0, Math.sin(t)) * 20,
      })),
      footR: generateTrackKeyframes(3.2, 30, (t) => ({
        rotation: 10 + Math.max(0, -Math.sin(t)) * 30,
        y: -Math.max(0, -Math.sin(t)) * 20,
      })),
      handL: generateTrackKeyframes(3.2, 30, (t) => ({
        rotation: -70 + Math.sin(t) * 20,
      })),
      handR: generateTrackKeyframes(3.2, 30, (t) => ({
        rotation: 20 - Math.sin(t) * 20,
      })),
      earL: generateTrackKeyframes(3.2, 30, (t) => ({
        rotation: -8 + Math.sin(t * 2) * 8,
      })),
      earR: generateTrackKeyframes(3.2, 30, (t) => ({
        rotation: 8 - Math.sin(t * 2) * 8,
      })),
    },
  },
];
