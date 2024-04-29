import { Colour, Pixels } from "../flavours";

export default function drawOutlined(
  ctx: CanvasRenderingContext2D,
  path: Path2D,
  fill: Colour,
  stroke = fill,
  fillAlpha = 0.1,
  strokeAlpha = fillAlpha * 2,
  strokeWidth: Pixels = 2,
) {
  ctx.globalAlpha = fillAlpha;
  ctx.fillStyle = fill;
  ctx.fill(path);

  ctx.globalAlpha = strokeAlpha;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = strokeWidth;
  ctx.stroke(path);

  ctx.globalAlpha = 1;
}
