import AnimationController from "../components/AnimationController";
import ResourceManager from "../components/ResourceManager";
import { Pixels, Radians, Tiles } from "../flavours";
import getOctant from "../tools/getOctant";
import { roundXY } from "../tools/xy";
import Drawable from "../types/Drawable";
import GameEvents from "../types/GameEvents";
import DebugFlags from "../types/DebugFlags";
import { SpriteSheet } from "../types/SpriteAnimation";
import XY from "../types/XY";

export default class EntityBase<TPrefix = unknown> implements Drawable {
  anim: AnimationController;
  attackRange?: Tiles;
  prefix: TPrefix;
  resetPrefixes: Set<TPrefix>;

  constructor(
    protected e: GameEvents,
    res: ResourceManager,
    render: Set<Drawable>,
    spriteSheet: SpriteSheet,
    startAnimation: TPrefix,
    resetAnimations: TPrefix[],
    public position: XY<Tiles>,
    public radius: Tiles,
    public height: Tiles,
    public heading: Radians = 0,
  ) {
    this.prefix = startAnimation;
    this.anim = new AnimationController(
      e,
      res,
      spriteSheet,
      `${startAnimation}2`,
    );
    this.resetPrefixes = new Set(resetAnimations);

    render.add(this);
  }

  get positionRounded() {
    return roundXY(this.position);
  }

  protected animate(prefix: TPrefix) {
    const octant = getOctant(this.heading);
    const id = `${prefix}${octant}`;

    if (
      this.prefix !== prefix &&
      (this.resetPrefixes.has(prefix) || this.resetPrefixes.has(this.prefix))
    )
      this.anim.play(id);
    else this.anim.shift(id);

    this.prefix = prefix;
  }

  draw(ctx: CanvasRenderingContext2D, o: XY<Pixels>, fl: DebugFlags) {
    this.anim.draw(ctx, o, fl.outline);
  }
}
