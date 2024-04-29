import { Pixels } from "../flavours";
import RenderFlags from "./RenderFlags";
import XY from "./XY";

export default interface Drawable {
  position: XY<Pixels>;
  radius: Pixels;

  draw(
    ctx: CanvasRenderingContext2D,
    offset: XY<Pixels>,
    flags: RenderFlags,
  ): void;
}
