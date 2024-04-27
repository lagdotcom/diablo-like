import { Milliseconds, Pixels } from "./flavours";

export class CanvasResizeEvent extends CustomEvent<{
  width: Pixels;
  height: Pixels;
}> {
  constructor(width: Pixels, height: Pixels) {
    super("CanvasResize", { detail: { width, height } });
  }
}

export class LeftMouseEvent extends CustomEvent<{ x: Pixels; y: Pixels }> {
  constructor(x: Pixels, y: Pixels) {
    super("LeftMouse", { detail: { x, y } });
  }
}

export class RenderEvent extends CustomEvent<{
  ctx: CanvasRenderingContext2D;
}> {
  constructor(ctx: CanvasRenderingContext2D) {
    super("Render", { detail: { ctx } });
  }
}

export class TickEvent extends CustomEvent<{ step: Milliseconds }> {
  constructor(step: Milliseconds) {
    super("Tick", { detail: { step } });
  }
}
