import { Pixels, Tiles } from "../flavours";
import RenderFlags from "./RenderFlags";
import XY from "./XY";

export default interface Drawable {
  position: XY<Tiles>;
  radius: Tiles;

  draw(
    ctx: CanvasRenderingContext2D,
    offset: XY<Pixels>,
    flags: RenderFlags,
  ): void;
}
