import { AnimationTriggerEvent, TickEvent } from "../events";
import { AnimationID, AnimationTriggerID, Pixels } from "../flavours";
import { Listener } from "../types/Dispatcher";
import Game from "../types/Game";
import { SpriteSheet } from "../types/SpriteAnimation";
import XY from "../types/XY";

export default class AnimationController {
  img!: HTMLImageElement;
  currentAnimation!: AnimationID;
  currentFrameIndex: number;
  spriteDuration: number;

  constructor(
    private g: Game,
    private sheet: SpriteSheet,
    animation: AnimationID,
  ) {
    this.currentFrameIndex = 0;
    this.spriteDuration = 0;
    this.play(animation);

    // eslint-disable-next-line promise/catch-or-return
    g.res.loadImage(sheet.url).then((img) => (this.img = img));
    g.addEventListener("Tick", this.onTick, { passive: true });
  }

  get offset(): XY<Pixels> {
    const a = this.sheet.animations[this.currentAnimation];
    return a.offset ?? this.sheet.globalOffset;
  }

  private trigger(trigger: AnimationTriggerID) {
    this.g.dispatchEvent(new AnimationTriggerEvent(this, trigger));
  }

  private loadFrame() {
    const f =
      this.sheet.animations[this.currentAnimation].frames[
        this.currentFrameIndex
      ];

    this.spriteDuration = f.duration;

    if (f.trigger) this.trigger(f.trigger);
  }

  private nextFrame() {
    this.currentFrameIndex++;

    const a = this.sheet.animations[this.currentAnimation];
    if (this.currentFrameIndex >= a.frames.length) {
      if (typeof a.loopTo !== "undefined") {
        this.currentFrameIndex = a.loopTo;
      } else if (a.endTrigger) return this.trigger(a.endTrigger);
    }

    this.loadFrame();
  }

  private checkAnim(animation: AnimationID) {
    if (!this.sheet.animations[animation]) {
      console.warn(`tried to play animation: ${animation}`);
      return true;
    }
  }

  play(animation: AnimationID) {
    if (this.checkAnim(animation)) return;

    this.currentAnimation = animation;
    this.currentFrameIndex = 0;
    this.loadFrame();
  }

  shift(animation: AnimationID) {
    if (this.checkAnim(animation)) return;

    this.currentAnimation = animation;
  }

  onTick: Listener<TickEvent> = ({ detail: { step } }) => {
    this.spriteDuration -= step;
    if (this.spriteDuration <= 0) this.nextFrame();
  };

  draw(ctx: CanvasRenderingContext2D, o: XY<Pixels>) {
    const f =
      this.sheet.animations[this.currentAnimation].frames[
        this.currentFrameIndex
      ];
    const s = this.sheet.sprites[f.id];

    const { x: sx, y: sy } = s.position;
    const { x: w, y: h } = s.size;
    const { x: dx, y: dy } = o;
    const { x: ox, y: oy } = this.offset;

    ctx.drawImage(
      this.img,
      sx,
      sy,
      w,
      h,
      Math.round(dx + ox),
      Math.round(dy + oy),
      w,
      h,
    );
  }
}
