import { Pixels } from "../flavours";

export default interface Drawable {
  x: Pixels;
  y: Pixels;
  radius: Pixels;

  draw(ctx: CanvasRenderingContext2D, ox: Pixels, oy: Pixels): void;
}
