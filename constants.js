export const LEVEL_WIDTH = 5000;
/**
 * WARNING: this can't be too high, because when we draw we have to iterate
 * through the full height irrespective of the viewport, so it's the major
 * bottleneck here performance-wise
 *
 * */
export const LEVEL_HEIGHT = 180;

export const LEVEL_OCTAVES = 4;
export const BASE_AMPLITUDE = 70;
export const BASE_WAVELENGTH = 120;

export const CAVE_PERLIN_CUTOFF = 0.4;
export const CLOUD_PERLIN_CUTOFF = 0.7;
export const ISLAND_PERLIN_CUTOFF = 0.3;

export const HORIZON = (LEVEL_HEIGHT * 0.65) | 0;
export const BLOCK_SIZE = 32;

export const TREE_CHANCE = 0.8;

export const fontFamily = 'Helvetica,Ariel,sans-serif';
