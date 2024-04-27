import { Colour, Pixels } from "../flavours";

export default function drawCircle(
  ctx: CanvasRenderingContext2D,
  x: Pixels,
  y: Pixels,
  r: Pixels,
  stroke: Colour,
  fill: Colour,
) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, r, r / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = stroke;
  ctx.beginPath();
  ctx.ellipse(x, y, r, r / 2, 0, 0, Math.PI * 2);
  ctx.stroke();
}
