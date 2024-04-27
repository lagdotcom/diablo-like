import { Milliseconds, Pixels } from "./flavours";
import XY from "./types/XY";

export class CanvasResizeEvent extends CustomEvent<{
  width: Pixels;
  height: Pixels;
}> {
  constructor(width: Pixels, height: Pixels) {
    super("CanvasResize", { detail: { width, height } });
  }
}

export class LeftMouseEvent extends CustomEvent<XY<Pixels>> {
  constructor(detail: XY<Pixels>) {
    super("LeftMouse", { detail });
  }
}

export class RenderEvent extends CustomEvent<{
  ctx: CanvasRenderingContext2D;
}> {
  constructor(ctx: CanvasRenderingContext2D) {
    super("Render", { detail: { ctx } });
  }
}

export class RightMouseEvent extends CustomEvent<XY<Pixels>> {
  constructor(detail: XY<Pixels>) {
    super("RightMouse", { detail });
  }
}

export class TickEvent extends CustomEvent<{ step: Milliseconds }> {
  constructor(step: Milliseconds) {
    super("Tick", { detail: { step } });
  }
}
