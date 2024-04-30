import { Pixels, Radians, WorldU } from "../flavours";
import Projection from "../types/Projection";
import XY from "../types/XY";

export default class FlatProjection implements Projection {
  headingOffset: Radians;

  constructor(
    private scaleY = 1,
    private scaleH = 1,
  ) {
    this.headingOffset = 0;
  }

  screenToWorld(screen: XY<Pixels>): XY<WorldU> {
    const { x, y } = screen;
    return { x: x as WorldU, y: (y * this.scaleY) as WorldU };
  }

  worldToScreen(logical: XY<WorldU>): XY<Pixels> {
    const { x, y } = logical;
    return { x: x as Pixels, y: (y / this.scaleY) as Pixels };
  }

  getHeight(height: WorldU): Pixels {
    return height / this.scaleH;
  }
}
