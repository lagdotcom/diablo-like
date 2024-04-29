import AnimationController from "../components/AnimationController";
import { Pixels, Radians } from "../flavours";
import drawOutlined from "../tools/drawOutlined";
import getOctant from "../tools/getOctant";
import makeCylinderPath from "../tools/makeCylinderPath";
import Drawable from "../types/Drawable";
import Game from "../types/Game";
import RenderFlags from "../types/RenderFlags";
import { SpriteSheet } from "../types/SpriteAnimation";
import XY from "../types/XY";

export default class EntityBase<TPrefix> implements Drawable {
  anim: AnimationController;
  attackRange?: Pixels;
  prefix: TPrefix;
  resetPrefixes: Set<TPrefix>;

  constructor(
    protected g: Game,
    spriteSheet: SpriteSheet,
    startAnimation: TPrefix,
    resetAnimations: TPrefix[],
    public position: XY<Pixels>,
    public radius: Pixels,
    public height: Pixels,
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
    if (fl.attackBox && this.attackRange) {
      const path = makeCylinderPath(
        o.x,
        o.y,
        this.radius + this.attackRange,
        this.height,
      );
      drawOutlined(ctx, path, "red");
    }

    if (fl.hitBox) {
      const path = makeCylinderPath(o.x, o.y, this.radius, this.height);
      drawOutlined(ctx, path, "blue");
    }

    this.anim.draw(ctx, o);
  }
}
