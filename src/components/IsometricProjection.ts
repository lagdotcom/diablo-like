import { Pixels, Radians, WorldU } from "../flavours";
import Projection from "../types/Projection";
import XY from "../types/XY";

export default class IsometricProjection implements Projection {
  headingOffset: Radians;

  constructor(private tileSize = 1) {
    // TODO what is this number???
    this.headingOffset = Math.PI / -8;
  }

  screenToWorld(screen: XY<Pixels>): XY<WorldU> {
    const x = (2 * screen.y + screen.x) / (2 * this.tileSize);
    const y = (2 * screen.y - screen.x) / (2 * this.tileSize);
    return { x, y };
  }

  worldToScreen(world: XY<WorldU>): XY<Pixels> {
    const x = (world.x - world.y) * this.tileSize;
    const y = ((world.x + world.y) * this.tileSize) / 2;
    return { x, y };
  }

  getHeight(height: WorldU): Pixels {
    return height as Pixels;
  }
}
