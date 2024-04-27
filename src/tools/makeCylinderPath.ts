import { Pixels } from "../flavours";

export default function makeCylinderPath(
  x: Pixels,
  y: Pixels,
  radius: Pixels,
  height: Pixels,
) {
  const path = new Path2D();
  path.ellipse(x, y, radius, radius / 2, 0, 0, Math.PI);
  path.ellipse(x, y - height, radius, radius / 2, 0, Math.PI, Math.PI * 2);
  path.lineTo(x + radius, y);

  return path;
}
