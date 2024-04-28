import AnimationController from "./components/AnimationController";
import {
  AnimationTriggerID,
  ButtonIndex,
  Milliseconds,
  Pixels,
  Radians,
} from "./flavours";
import Empty from "./types/Empty";
import XY from "./types/XY";

export class AnimationTriggerEvent extends CustomEvent<{
  controller: AnimationController;
  trigger: AnimationTriggerID;
}> {
  constructor(controller: AnimationController, trigger: AnimationTriggerID) {
    super("AnimationTrigger", { detail: { controller, trigger } });
  }
}

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

export class LoadingEvent extends CustomEvent<{ now: number; max: number }> {
  constructor(now: number, max: number) {
    super("Loading", { detail: { now, max } });
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
