import { LimbId, LimbPose, PuppetPose } from '../types';

export interface LimbConfig {
  id: LimbId;
  name: string;
  category: 'core' | 'arm' | 'leg' | 'face';
  color: string;
  pivot: { x: number; y: number };
  baseRotation: number;
  rotationRange: [number, number]; // [min, max] in deg
  xRange: [number, number]; // [min, max] in px
  yRange: [number, number]; // [min, max] in px
  description: string;
}

export const LIMB_CONFIGS: Record<LimbId, LimbConfig> = {
  body: {
    id: 'body',
    name: 'Body & Torso',
    category: 'core',
    color: '#0284c7', // Sky blue
    pivot: { x: 150, y: 175 },
    baseRotation: 0,
    rotationRange: [-35, 35],
    xRange: [-45, 45],
    yRange: [-40, 40],
    description: 'Main body bounce, sway, and squash/stretch.',
  },
  head: {
    id: 'head',
    name: 'Head & Neck',
    category: 'core',
    color: '#ec4899', // Pink
    pivot: { x: 150, y: 103 },
    baseRotation: 0,
    rotationRange: [-55, 55],
    xRange: [-30, 30],
    yRange: [-25, 25],
    description: 'Head nodding, tilt, and expressive bobbing.',
  },
  handL: {
    id: 'handL',
    name: 'Left Hand',
    category: 'arm',
    color: '#8b5cf6', // Purple
    pivot: { x: 231, y: 162 },
    baseRotation: -90,
    rotationRange: [-180, 45],
    xRange: [-35, 35],
    yRange: [-35, 35],
    description: 'Left arm gestures, wave, point, and flap.',
  },
  handR: {
    id: 'handR',
    name: 'Right Hand',
    category: 'arm',
    color: '#a855f7', // Violet
    pivot: { x: 90, y: 170 },
    baseRotation: 0,
    rotationRange: [-90, 150],
    xRange: [-35, 35],
    yRange: [-35, 35],
    description: 'Right arm gestures, wave, point, and raise.',
  },
  footL: {
    id: 'footL',
    name: 'Left Foot',
    category: 'leg',
    color: '#10b981', // Emerald
    pivot: { x: 175, y: 240 },
    baseRotation: -10,
    rotationRange: [-40, 40],
    xRange: [-25, 25],
    yRange: [-30, 20],
    description: 'Left foot tap, kick, and step lift.',
  },
  footR: {
    id: 'footR',
    name: 'Right Foot',
    category: 'leg',
    color: '#059669', // Green
    pivot: { x: 125, y: 240 },
    baseRotation: 10,
    rotationRange: [-40, 40],
    xRange: [-25, 25],
    yRange: [-30, 20],
    description: 'Right foot tap, kick, and step lift.',
  },
  earL: {
    id: 'earL',
    name: 'Left Ear',
    category: 'face',
    color: '#f43f5e', // Rose
    pivot: { x: 175, y: 55 },
    baseRotation: 0,
    rotationRange: [-35, 35],
    xRange: [-15, 15],
    yRange: [-15, 15],
    description: 'Left ear perking and floppy wiggle.',
  },
  earR: {
    id: 'earR',
    name: 'Right Ear',
    category: 'face',
    color: '#e11d48', // Red rose
    pivot: { x: 125, y: 55 },
    baseRotation: 0,
    rotationRange: [-35, 35],
    xRange: [-15, 15],
    yRange: [-15, 15],
    description: 'Right ear perking and floppy wiggle.',
  },
  snout: {
    id: 'snout',
    name: 'Snout & Nostrils',
    category: 'face',
    color: '#f97316', // Orange
    pivot: { x: 153, y: 77 },
    baseRotation: 0,
    rotationRange: [-25, 25],
    xRange: [-20, 20],
    yRange: [-15, 15],
    description: 'Pig snout twitch, snort puff, and sniffing.',
  },
  eyes: {
    id: 'eyes',
    name: 'Eyes',
    category: 'face',
    color: '#eab308', // Amber
    pivot: { x: 145, y: 67 },
    baseRotation: 0,
    rotationRange: [-15, 15],
    xRange: [-12, 12],
    yRange: [-10, 10],
    description: 'Eye direction and expressive blinking.',
  },
};

export const LIMB_ORDER: LimbId[] = [
  'body',
  'head',
  'handL',
  'handR',
  'footL',
  'footR',
  'earL',
  'earR',
  'snout',
  'eyes',
];

export const DEFAULT_REST_POSE: PuppetPose = {
  body: { rotation: 0, x: 0, y: 0, scaleX: 1, scaleY: 1 },
  head: { rotation: 0, x: 0, y: 0, scaleX: 1, scaleY: 1 },
  handL: { rotation: -90, x: 0, y: 0, scaleX: 1, scaleY: 1 },
  handR: { rotation: 0, x: 0, y: 0, scaleX: 1, scaleY: 1 },
  footL: { rotation: -10, x: 0, y: 0, scaleX: 1, scaleY: 1 },
  footR: { rotation: 10, x: 0, y: 0, scaleX: 1, scaleY: 1 },
  earL: { rotation: 0, x: 0, y: 0, scaleX: 1, scaleY: 1 },
  earR: { rotation: 0, x: 0, y: 0, scaleX: 1, scaleY: 1 },
  snout: { rotation: 0, x: 0, y: 0, scaleX: 1, scaleY: 1 },
  eyes: { rotation: 0, x: 0, y: 0, scaleX: 1, scaleY: 1 },
};

export const DEFAULT_PIVOTS: Record<LimbId, { x: number; y: number }> = {
  body: { x: 150, y: 175 },
  head: { x: 150, y: 103 },
  handL: { x: 231, y: 162 },
  handR: { x: 90, y: 170 },
  footL: { x: 175, y: 240 },
  footR: { x: 125, y: 240 },
  earL: { x: 175, y: 55 },
  earR: { x: 125, y: 55 },
  snout: { x: 153, y: 77 },
  eyes: { x: 145, y: 67 },
};

export const PIGGY_ACTIVE_LIMBS: LimbId[] = [
  'body',
  'head',
  'handL',
  'handR',
  'footL',
  'footR',
  'earL',
  'earR',
  'snout',
  'eyes',
];

export const DEATH_ACTIVE_LIMBS: LimbId[] = [
  'body',
  'head',
  'handL',
  'handR',
  'footL',
  'footR',
  'eyes',
];

export const DEATH_LIMB_CONFIGS: Record<LimbId, LimbConfig> = {
  body: {
    id: 'body',
    name: 'Ribs, Spine & Robe',
    category: 'core',
    color: '#0284c7', // Sky blue
    pivot: { x: 150, y: 165 },
    baseRotation: 0,
    rotationRange: [-45, 45],
    xRange: [-45, 45],
    yRange: [-40, 40],
    description: 'Skeletal spine & robe sway, bounce, and posture.',
  },
  head: {
    id: 'head',
    name: 'Skull & Hood',
    category: 'core',
    color: '#ec4899', // Pink
    pivot: { x: 150, y: 100 },
    baseRotation: 0,
    rotationRange: [-60, 60],
    xRange: [-30, 30],
    yRange: [-25, 25],
    description: 'Skull nodding, eerie head tilt, and menacing bobbing.',
  },
  handL: {
    id: 'handL',
    name: 'Left Arm & Bone',
    category: 'arm',
    color: '#8b5cf6', // Purple
    pivot: { x: 187, y: 120 },
    baseRotation: 0,
    rotationRange: [-180, 180],
    xRange: [-40, 40],
    yRange: [-40, 40],
    description: 'Left bone arm swing, point, reach, and gestures.',
  },
  handR: {
    id: 'handR',
    name: 'Right Arm & Bone',
    category: 'arm',
    color: '#a855f7', // Violet
    pivot: { x: 112, y: 120 },
    baseRotation: 0,
    rotationRange: [-180, 180],
    xRange: [-40, 40],
    yRange: [-40, 40],
    description: 'Right bone arm swing, scythe gesture, and reach.',
  },
  footL: {
    id: 'footL',
    name: 'Left Leg & Bone',
    category: 'leg',
    color: '#10b981', // Emerald
    pivot: { x: 173, y: 219 },
    baseRotation: 0,
    rotationRange: [-55, 55],
    xRange: [-30, 30],
    yRange: [-30, 20],
    description: 'Left skeletal leg step, stride, and floating lift.',
  },
  footR: {
    id: 'footR',
    name: 'Right Leg & Bone',
    category: 'leg',
    color: '#059669', // Green
    pivot: { x: 127, y: 219 },
    baseRotation: 0,
    rotationRange: [-55, 55],
    xRange: [-30, 30],
    yRange: [-30, 20],
    description: 'Right skeletal leg step, stride, and floating lift.',
  },
  eyes: {
    id: 'eyes',
    name: 'Glowing Blue Eyes',
    category: 'face',
    color: '#38bdf8', // Light blue
    pivot: { x: 150, y: 63 },
    baseRotation: 0,
    rotationRange: [-25, 25],
    xRange: [-15, 15],
    yRange: [-12, 12],
    description: 'Eerie blue glowing eye sockets gaze and glaring shift.',
  },
  earL: {
    id: 'earL',
    name: 'Left Ear (N/A)',
    category: 'face',
    color: '#f43f5e',
    pivot: { x: 175, y: 55 },
    baseRotation: 0,
    rotationRange: [-35, 35],
    xRange: [-15, 15],
    yRange: [-15, 15],
    description: 'Not present on Grim Reaper skeleton.',
  },
  earR: {
    id: 'earR',
    name: 'Right Ear (N/A)',
    category: 'face',
    color: '#e11d48',
    pivot: { x: 125, y: 55 },
    baseRotation: 0,
    rotationRange: [-35, 35],
    xRange: [-15, 15],
    yRange: [-15, 15],
    description: 'Not present on Grim Reaper skeleton.',
  },
  snout: {
    id: 'snout',
    name: 'Snout (N/A)',
    category: 'face',
    color: '#f97316',
    pivot: { x: 150, y: 80 },
    baseRotation: 0,
    rotationRange: [-25, 25],
    xRange: [-20, 20],
    yRange: [-15, 15],
    description: 'Not present on Grim Reaper skeleton.',
  },
};

export const DEATH_PIVOTS: Record<LimbId, { x: number; y: number }> = {
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
  eyes: { rotation: 0, x: 0, y: 0, scaleX: 1, scaleY: 1 },
  earL: { rotation: 0, x: 0, y: 0, scaleX: 1, scaleY: 1 },
  earR: { rotation: 0, x: 0, y: 0, scaleX: 1, scaleY: 1 },
  snout: { rotation: 0, x: 0, y: 0, scaleX: 1, scaleY: 1 },
};

export const DEATH_PIVOT_PRESETS: Partial<Record<LimbId, { label: string; x: number; y: number }[]>> = {
  handR: [
    { label: 'Shoulder Joint', x: 112, y: 120 },
    { label: 'Mid Arm (Elbow)', x: 112, y: 145 },
    { label: 'Hand Bone Tip', x: 112, y: 175 },
  ],
  handL: [
    { label: 'Shoulder Joint', x: 187, y: 120 },
    { label: 'Mid Arm (Elbow)', x: 187, y: 145 },
    { label: 'Hand Bone Tip', x: 187, y: 175 },
  ],
  head: [
    { label: 'Neck Base', x: 150, y: 100 },
    { label: 'Skull Center', x: 150, y: 75 },
    { label: 'Crown / Hood Top', x: 150, y: 48 },
  ],
  body: [
    { label: 'Pelvis / Base', x: 150, y: 179 },
    { label: 'Ribs Center', x: 150, y: 145 },
    { label: 'Upper Spine', x: 150, y: 115 },
  ],
  footR: [
    { label: 'Hip Joint', x: 127, y: 219 },
    { label: 'Mid Leg / Knee', x: 127, y: 240 },
    { label: 'Foot Bone', x: 112, y: 260 },
  ],
  footL: [
    { label: 'Hip Joint', x: 173, y: 219 },
    { label: 'Mid Leg / Knee', x: 173, y: 240 },
    { label: 'Foot Bone', x: 188, y: 260 },
  ],
  eyes: [
    { label: 'Eye Socket Center', x: 150, y: 63 },
  ],
};

export function getCharacterConfigs(characterType: 'piggy' | 'death' | string): Record<LimbId, LimbConfig> {
  return characterType === 'death' ? DEATH_LIMB_CONFIGS : LIMB_CONFIGS;
}

export function getCharacterPivots(characterType: 'piggy' | 'death' | string): Record<LimbId, { x: number; y: number }> {
  return characterType === 'death' ? DEATH_PIVOTS : DEFAULT_PIVOTS;
}

export function getCharacterRestPose(characterType: 'piggy' | 'death' | string): PuppetPose {
  return characterType === 'death' ? { ...DEATH_REST_POSE } : { ...DEFAULT_REST_POSE };
}

export function getCharacterPivotPresets(characterType: 'piggy' | 'death' | string): Partial<Record<LimbId, { label: string; x: number; y: number }[]>> {
  return characterType === 'death' ? DEATH_PIVOT_PRESETS : PIVOT_PRESETS;
}

export function getCharacterActiveLimbs(characterType: 'piggy' | 'death' | string): LimbId[] {
  return characterType === 'death' ? DEATH_ACTIVE_LIMBS : PIGGY_ACTIVE_LIMBS;
}

