import { Pixels, Tiles } from "../flavours";
import Camera from "../visuals/Camera";
import DebugFlags from "./DebugFlags";
import XY from "./XY";

export default interface Drawable {
  position: XY<Tiles>;
  radius: Tiles;

  draw(
    ctx: CanvasRenderingContext2D,
    offset: XY<Pixels>,
    flags: DebugFlags,
    camera: Camera,
  ): void;
}
