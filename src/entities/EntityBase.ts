import AnimationController from "../components/AnimationController";
import { Pixels, Radians, Tiles } from "../flavours";
import getOctant from "../tools/getOctant";
import Drawable from "../types/Drawable";
import Game from "../types/Game";
import RenderFlags from "../types/RenderFlags";
import { SpriteSheet } from "../types/SpriteAnimation";
import XY from "../types/XY";

export default class EntityBase<TPrefix> implements Drawable {
  anim: AnimationController;
  attackRange?: Tiles;
  prefix: TPrefix;
  resetPrefixes: Set<TPrefix>;

  constructor(
    protected g: Game,
    spriteSheet: SpriteSheet,
    startAnimation: TPrefix,
    resetAnimations: TPrefix[],
    public position: XY<Tiles>,
    public radius: Tiles,
    public height: Tiles,
    public heading: Radians = 0,
  ) {
    this.prefix = startAnimation;
    this.anim = new AnimationController(g, spriteSheet, `${startAnimation}2`);
    this.resetPrefixes = new Set(resetAnimations);

    g.render.add(this);
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

  draw(ctx: CanvasRenderingContext2D, o: XY<Pixels>, fl: RenderFlags) {
    this.anim.draw(ctx, o, fl.imageOutline);
  }
}
