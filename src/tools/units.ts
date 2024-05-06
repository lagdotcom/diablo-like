import { TilesPerMillisecond } from "../flavours";

export function tilesPerSecond(tps: number): TilesPerMillisecond {
  return tps / 1000;
}
