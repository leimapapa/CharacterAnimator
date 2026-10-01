export type LimbId =
  | 'body'
  | 'head'
  | 'handL'
  | 'handR'
  | 'footL'
  | 'footR'
  | 'earL'
  | 'earR'
  | 'snout'
  | 'eyes';

export interface LimbPose {
  rotation: number; // degrees
  x: number; // offset X in svg units
  y: number; // offset Y in svg units
  scaleX?: number;
  scaleY?: number;
}

export type PuppetPose = Record<LimbId, LimbPose>;

export type LimbPivots = Record<LimbId, { x: number; y: number }>;

export interface KeyframePoint {
  time: number; // in seconds from 0 to timeline duration
  pose: LimbPose;
}

export interface LayerTrack {
  id: LimbId;
  name: string;
  color: string;
  isArmed: boolean;
  isMuted: boolean;
  isSolo: boolean;
  weight: number; // 0 to 2 (1 = 100%)
  timeOffset: number; // seconds
  keyframes: KeyframePoint[];
}

export interface TimelineState {
  currentTime: number; // seconds
  duration: number; // e.g. 5 seconds
  fps: number; // 30 or 60
  isPlaying: boolean;
  isRecording: boolean;
  isLooping: boolean;
  countIn: number; // 0 = not in countdown, 3, 2, 1
}

export interface WebcamMapping {
  limbId: LimbId;
  parameter: 'rotation' | 'x' | 'y' | 'scaleY';
  source: 'handX' | 'handY' | 'handRotation' | 'handPinch' | 'headX' | 'headY' | 'headTilt' | 'mouthOpen' | 'motionEnergy';
  invert: boolean;
  multiplier: number;
}

export interface WebcamTrackingState {
  active: boolean;
  calibrated: boolean;
  calibratedX: number;
  calibratedY: number;
  rawX: number; // -1 to 1
  rawY: number; // -1 to 1
  rawTilt: number; // degrees
  mouthOpen: number; // 0 to 1
  motionEnergy: number; // 0 to 1
  smoothedX: number;
  smoothedY: number;
  smoothedTilt: number;
  mappings: WebcamMapping[];
  sensitivity: number;
  smoothing: number;
  // ML Hand tracking fields
  targetLimb: LimbId;
  handDetected: boolean;
  handType: 'Right' | 'Left' | 'Unknown';
  handLandmarks?: { x: number; y: number; z: number }[];
  handAngle: number;
  pinchDistance: number;
  mlModelLoaded: boolean;
}

export interface PresetAnimation {
  id: string;
  name: string;
  description: string;
  category: string;
  duration: number;
  tracks: Partial<Record<LimbId, KeyframePoint[]>>;
}
