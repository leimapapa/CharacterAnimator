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

export const PIVOT_PRESETS: Partial<Record<LimbId, { label: string; x: number; y: number }[]>> = {
  handR: [
    { label: 'Shoulder Joint', x: 90, y: 170 },
    { label: 'Mid Arm (Elbow)', x: 65, y: 170 },
    { label: 'Hand Tip', x: 38, y: 170 },
  ],
  handL: [
    { label: 'Shoulder Joint', x: 231, y: 162 },
    { label: 'Mid Arm (Elbow)', x: 231, y: 190 },
    { label: 'Hand Tip', x: 231, y: 220 },
  ],
  head: [
    { label: 'Neck Base', x: 150, y: 103 },
    { label: 'Head Center', x: 150, y: 75 },
    { label: 'Crown / Top', x: 150, y: 40 },
  ],
  body: [
    { label: 'Waist (Default)', x: 150, y: 175 },
    { label: 'Chest Center', x: 150, y: 145 },
    { label: 'Hips / Base', x: 150, y: 215 },
  ],
  footL: [
    { label: 'Hip / Joint', x: 175, y: 240 },
    { label: 'Mid Leg', x: 175, y: 255 },
    { label: 'Hoof / Tip', x: 175, y: 270 },
  ],
  footR: [
    { label: 'Hip / Joint', x: 125, y: 240 },
    { label: 'Mid Leg', x: 125, y: 255 },
    { label: 'Hoof / Tip', x: 125, y: 270 },
  ],
  earL: [
    { label: 'Ear Root', x: 175, y: 55 },
    { label: 'Ear Mid', x: 185, y: 40 },
    { label: 'Ear Tip', x: 195, y: 25 },
  ],
  earR: [
    { label: 'Ear Root', x: 125, y: 55 },
    { label: 'Ear Mid', x: 115, y: 40 },
    { label: 'Ear Tip', x: 105, y: 25 },
  ],
  snout: [
    { label: 'Nose Bridge', x: 153, y: 77 },
    { label: 'Snout Center', x: 153, y: 92 },
    { label: 'Tip', x: 153, y: 102 },
  ],
  eyes: [
    { label: 'Pupil Center', x: 145, y: 67 },
    { label: 'Upper Brow', x: 145, y: 58 },
  ],
};
