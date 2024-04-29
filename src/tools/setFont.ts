export default function setFont(
  ctx: CanvasRenderingContext2D,
  font: CanvasRenderingContext2D["font"],
  colour: CanvasRenderingContext2D["fillStyle"],
  alignX: CanvasRenderingContext2D["textAlign"],
  alignY: CanvasRenderingContext2D["textBaseline"],
) {
  ctx.font = font;
  ctx.fillStyle = colour;
  ctx.textAlign = alignX;
  ctx.textBaseline = alignY;
}
