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
