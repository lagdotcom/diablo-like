import { Pixels, Radians, WorldU } from "../flavours";
import XY from "./XY";

export default interface Projection {
  headingOffset: Radians;

  getHeight(height: WorldU): Pixels;
  screenToWorld(screen: XY<Pixels>): XY<WorldU>;
  worldToScreen(world: XY<WorldU>): XY<Pixels>;
}
