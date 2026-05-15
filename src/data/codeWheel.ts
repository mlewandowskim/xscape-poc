/**
 * Digit cell boundaries measured from code_wheel.png (2804×561).
 * Each cell is the source-pixel region for one digit (0–9).
 */
export interface CodeWheelCell {
  x: number;
  w: number;
}

export const CODE_WHEEL_CELLS: CodeWheelCell[] = [
  { x: 27,   w: 285 }, // 0
  { x: 312,  w: 277 }, // 1
  { x: 589,  w: 274 }, // 2
  { x: 863,  w: 277 }, // 3
  { x: 1140, w: 273 }, // 4
  { x: 1413, w: 278 }, // 5
  { x: 1691, w: 275 }, // 6
  { x: 1966, w: 277 }, // 7
  { x: 2243, w: 275 }, // 8
  { x: 2518, w: 258 }, // 9
];

export const CODE_WHEEL_CELL_HEIGHT = 561;
export const CODE_WHEEL_TOTAL_WIDTH = 2804;

/** Vertical extent of the digit glyph within each cell (source pixels). */
export const CODE_WHEEL_DIGIT_TOP = 153;
export const CODE_WHEEL_DIGIT_BOTTOM = 353;
