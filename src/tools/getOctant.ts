import { Radians } from "../flavours";

const octantAngles: number[] = [
  (-7 * Math.PI) / 8,
  (-5 * Math.PI) / 8,
  (-3 * Math.PI) / 8,
  (-1 * Math.PI) / 8,
  (1 * Math.PI) / 8,
  (3 * Math.PI) / 8,
  (5 * Math.PI) / 8,
  (7 * Math.PI) / 8,
];

type Octant = 1 | 2 | 3 | 4 | 6 | 7 | 8 | 9;
const octantIndices: Octant[] = [7, 8, 9, 6, 3, 2, 1];

export default function getOctant(angle: Radians): Octant {
  for (let i = 0; i < octantAngles.length; i++) {
    const left = octantAngles[i];
    const right = octantAngles[i + 1];

    if (angle >= left && angle < right) return octantIndices[i];
  }

  return 4;
}
