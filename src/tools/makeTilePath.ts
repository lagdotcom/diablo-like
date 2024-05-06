import { Tiles } from "../flavours";
import XY from "../types/XY";
import IsometricCamera from "../visuals/Camera";
import { addXY } from "./xy";

export default function makeTilePath(
  proj: IsometricCamera,
  position: XY<Tiles>,
) {
  const a = proj.worldToScreen(addXY(position, { x: -0.5, y: -0.5 }));
  const b = proj.worldToScreen(addXY(position, { x: 0.5, y: -0.5 }));
  const c = proj.worldToScreen(addXY(position, { x: 0.5, y: 0.5 }));
  const d = proj.worldToScreen(addXY(position, { x: -0.5, y: 0.5 }));

  const path = new Path2D();
  path.moveTo(a.x, a.y);
  path.lineTo(b.x, b.y);
  path.lineTo(c.x, c.y);
  path.lineTo(d.x, d.y);
  return path;
}
