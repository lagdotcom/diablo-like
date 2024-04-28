import rogueSpritesUrl from "@img/diablo-rogue-lightarmour-bow.png";

import { AnimationTriggerID } from "../flavours";
import { xy } from "../tools/xy";
import Processor from "../types/Processor";
import { SpriteAnimation } from "../types/SpriteAnimation";
import { loop, makeAnimation, makeSpriteSheet } from "./tools";

export const AttackRelease: AnimationTriggerID = "attack.release";
export const AttackOver: AnimationTriggerID = "attack.over";

const RogueFire: Processor<SpriteAnimation> = (data) => ({
  frames: data.frames.map((frame, i) =>
    i === 7
      ? { id: frame.id, duration: frame.duration, trigger: AttackRelease }
      : frame,
  ),
  endTrigger: AttackOver,
  offset: xy(-64, -108),
});

export const RogueSpriteSheet = makeSpriteSheet(rogueSpritesUrl, xy(-48, -76), [
  makeAnimation("idle2", 8, 100, 0, 1046, 96, 94, loop),
  makeAnimation("idle1", 8, 100, 0, 1143, 96, 94, loop),
  makeAnimation("idle4", 8, 100, 0, 1240, 96, 94, loop),
  makeAnimation("idle7", 8, 100, 0, 1337, 96, 94, loop),
  makeAnimation("idle8", 8, 100, 0, 1434, 96, 94, loop),
  makeAnimation("idle9", 8, 100, 0, 1531, 96, 94, loop),
  makeAnimation("idle6", 8, 100, 0, 1628, 96, 94, loop),
  makeAnimation("idle3", 8, 100, 0, 1725, 96, 94, loop),

  makeAnimation("move2", 8, 50, 2690, 1046, 96, 94, loop),
  makeAnimation("move1", 8, 50, 2690, 1143, 96, 94, loop),
  makeAnimation("move4", 8, 50, 2690, 1240, 96, 94, loop),
  makeAnimation("move7", 8, 50, 2690, 1337, 96, 94, loop),
  makeAnimation("move8", 8, 50, 2690, 1434, 96, 94, loop),
  makeAnimation("move9", 8, 50, 2690, 1531, 96, 94, loop),
  makeAnimation("move6", 8, 50, 2690, 1628, 96, 94, loop),
  makeAnimation("move3", 8, 50, 2690, 1725, 96, 94, loop),

  makeAnimation("fire2", 12, 50, 0, 8, 128, 126, RogueFire),
  makeAnimation("fire1", 12, 50, 0, 137, 128, 126, RogueFire),
  makeAnimation("fire4", 12, 50, 0, 266, 128, 126, RogueFire),
  makeAnimation("fire7", 12, 50, 0, 395, 128, 126, RogueFire),
  makeAnimation("fire8", 12, 50, 0, 524, 128, 126, RogueFire),
  makeAnimation("fire9", 12, 50, 0, 653, 128, 126, RogueFire),
  makeAnimation("fire6", 12, 50, 0, 782, 128, 126, RogueFire),
  makeAnimation("fire3", 12, 50, 0, 911, 128, 126, RogueFire),
]);
