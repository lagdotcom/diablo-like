import { ButtonIndex, Milliseconds, Pixels, Radians } from "./flavours";
import Empty from "./types/Empty";
import XY from "./types/XY";

export class CanvasResizeEvent extends CustomEvent<{
  width: Pixels;
  height: Pixels;
}> {
  constructor(width: Pixels, height: Pixels) {
    super("CanvasResize", { detail: { width, height } });
  }
}

export class JoypadButtonEvent extends CustomEvent<ButtonIndex> {
  constructor(detail: ButtonIndex) {
    super("JoypadButton", { detail });
  }
}

export class JoypadMoveEvent extends CustomEvent<Radians> {
  constructor(detail: Radians) {
    super("JoypadMove", { detail });
  }
}

export class LeftMouseEvent extends CustomEvent<XY<Pixels>> {
  constructor(detail: XY<Pixels>) {
    super("LeftMouse", { detail });
  }
}

export class ProcessInputEvent extends CustomEvent<Empty> {
  constructor() {
    super("ProcessInput");
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
