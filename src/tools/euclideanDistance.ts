import XY from "../types/XY";

export default function euclideanDistance<T extends number>(
  a: XY<T>,
  b: XY<T>,
): T {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2) as T;
}
