import { Pixels, WorldU } from "../flavours";
import Projection from "../types/Projection";

export default function makeCylinderPath(
  proj: Projection,
  x: Pixels,
  y: Pixels,
  radius: WorldU,
  height: WorldU,
) {
  const radiusY = proj.getHeight(radius);

  const path = new Path2D();
  path.ellipse(x, y, radius, radiusY, 0, 0, Math.PI);
  path.ellipse(x, y - height, radius, radiusY, 0, Math.PI, Math.PI * 2);
  path.lineTo(x + radius, y);

  return path;
}
