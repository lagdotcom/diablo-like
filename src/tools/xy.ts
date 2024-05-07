import { Radians } from "../flavours";
import XY from "../types/XY";

export const xy = <T extends number>(x: T, y: T): XY<T> => ({ x, y });

export function addXY<T extends number>(a: XY<T>, b: XY<T>) {
  return xy(a.x + b.x, a.y + b.y) as XY<T>;
}

export function betweenXY<T extends number>(a: XY<T>, b: XY<T>) {
  return Math.atan2(a.y - b.y, a.x - b.x);
}

export function subXY<T extends number>(a: XY<T>, b: XY<T>) {
  return xy(a.x - b.x, a.y - b.y) as XY<T>;
}

export function vectorXY<T extends number>(angle: Radians, length: T) {
  return xy(Math.cos(angle) * length, Math.sin(angle) * length) as XY<T>;
}

export function eqXY<T extends number>(a: XY<T>, b: XY<T>) {
  return a.x === b.x && a.y === b.y;
}

export function roundXY<T extends number>({ x, y }: XY<T>) {
  return { x: Math.round(x), y: Math.round(y) } as XY<T>;
}

export function eqRoundXY<T extends number>(a: XY<T>, b: XY<T>) {
  return eqXY(roundXY(a), roundXY(b));
}

export function invalidXY<T extends number>({ x, y }: XY<T>) {
  return isNaN(x) || isNaN(y);
}

export function printXY<T extends number>(pos: XY<T>) {
  if (invalidXY(pos)) return "--";
  return `${pos.x.toFixed(1)},${pos.y.toFixed(1)}`;
}
