import { Pixels, WorldU } from "../flavours";
import RenderFlags from "./RenderFlags";
import XY from "./XY";

export default interface Drawable {
  position: XY<WorldU>;
  radius: WorldU;

  draw(
    ctx: CanvasRenderingContext2D,
    offset: XY<Pixels>,
    flags: RenderFlags,
  ): void;
}
