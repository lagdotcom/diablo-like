import fallenSpritesUrl from "@img/diablo-fallen-sword.png";

import { xy } from "../tools/xy";
import { loop, makeAnimation, makeSpriteSheet } from "./tools";

export const FallenSpriteSheet = makeSpriteSheet(
  fallenSpritesUrl,
  xy(-68, -76),
  [
    makeAnimation("idle2", 12, 100, 3458, 8, 128, 94, loop),
    makeAnimation("idle1", 12, 100, 3458, 104, 128, 94, loop),
    makeAnimation("idle4", 12, 100, 3458, 200, 128, 94, loop),
    makeAnimation("idle7", 12, 100, 3458, 296, 128, 94, loop),
    makeAnimation("idle8", 12, 100, 3458, 392, 128, 94, loop),
    makeAnimation("idle9", 12, 100, 3458, 488, 128, 94, loop),
    makeAnimation("idle6", 12, 100, 3458, 584, 128, 94, loop),
    makeAnimation("idle3", 12, 100, 3458, 680, 128, 94, loop),

    makeAnimation("move2", 12, 100, 3330, 783, 128, 94, loop),
    makeAnimation("move1", 12, 100, 3330, 879, 128, 94, loop),
    makeAnimation("move4", 12, 100, 3330, 975, 128, 94, loop),
    makeAnimation("move7", 12, 100, 3330, 1071, 128, 94, loop),
    makeAnimation("move8", 12, 100, 3330, 1167, 128, 94, loop),
    makeAnimation("move9", 12, 100, 3330, 1263, 128, 94, loop),
    makeAnimation("move6", 12, 100, 3330, 1359, 128, 94, loop),
    makeAnimation("move3", 12, 100, 3330, 1455, 128, 94, loop),
  ],
);
