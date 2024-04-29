import {
  AnimationID,
  Milliseconds,
  Pixels,
  ResourceURL,
  SpriteID,
} from "../flavours";
import { xy } from "../tools/xy";
import Processor from "../types/Processor";
import {
  SpriteAnimation,
  SpriteData,
  SpriteFrame,
  SpriteSheet,
} from "../types/SpriteAnimation";
import XY from "../types/XY";

const chars = "abcdefghijklmnopqrstuvwxyz";

export interface AnimationData {
  sprites: [SpriteID, SpriteData][];
  animation: [AnimationID, SpriteAnimation];
}

export const loop: Processor<SpriteAnimation> = (data) => {
  data.loopTo = 0;
  return data;
};

export const specify =
  (chars: string): Processor<SpriteAnimation> =>
  (data) => {
    data.frames = Array.from(chars).map((ch) => data.frames[chars.indexOf(ch)]);
    return data;
  };

export function makeAnimation(
  prefix: AnimationID,
  count: number,
  duration: Milliseconds,
  sx: Pixels,
  sy: Pixels,
  w: Pixels,
  h: Pixels,
  processor: Processor<SpriteAnimation> = (data) => data,
): AnimationData {
  const sprites: [SpriteID, SpriteData][] = [];
  const frames: SpriteFrame[] = [];

  let x = sx;
  for (let i = 0; i < count; i++) {
    sprites.push([
      `${prefix}${chars[i]}`,
      { position: xy(x, sy), size: xy(w, h) },
    ]);
    x += w;

    frames.push({ id: `${prefix}${chars[i]}`, duration });
  }

  return { sprites, animation: [prefix, processor({ frames })] };
}

export function makeSpriteSheet(
  url: ResourceURL,
  globalOffset: XY<Pixels>,
  dataArray: AnimationData[],
): SpriteSheet {
  return {
    url,
    globalOffset,
    sprites: Object.fromEntries(dataArray.flatMap((a) => a.sprites)),
    animations: Object.fromEntries(dataArray.map((a) => a.animation)),
  };
}
