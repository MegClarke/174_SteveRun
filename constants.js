export const TRAIN_DIMENSIONS = {
  SHORT: { w: 0.6, h: 0.8},
  TALL: {  w: 0.6, h: 1.6},
};

export const TRACK_WIDTH = 0.8;
export const MAX_HEIGHT_JUMP = 1;

export const LIGHTING_SETTINGS = {
  POINT_LIGHT: { color: 0xffffff, intensity: 100, distance: 100, position: [5, 5, 5] },
  DIRECTIONAL_LIGHT: { color: 0xffffff, intensity: 1, position: [0.5, 0, 1.0] },
  AMBIENT_LIGHT: { color: 0x505050 },
};

export const CAMERA_SETTINGS = {
  FOV: 75,
  ASPECT_RATIO: window.innerWidth / window.innerHeight,
  NEAR: 0.1,
  FAR: 1000,
  POSITION: [0, 5, 10],
};

export const ANIMATION_SETTINGS = {
  BASE_SPEED: 2,
  SPEED_INC: 0.02,
  MAX_SPEED: 5,
  DISAPPEAR_POSITION: 5,
};