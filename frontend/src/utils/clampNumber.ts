export function clampNumber(value: number, max: number): number {
  return Math.min(Math.max(0, value), Math.max(0, max));
}
