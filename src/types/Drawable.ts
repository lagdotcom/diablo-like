import { Pixels } from "../flavours";
import XY from "./XY";

export default interface Drawable {
  position: XY<Pixels>;
  radius: Pixels;

  draw(ctx: CanvasRenderingContext2D, offset: XY<Pixels>): void;
}
