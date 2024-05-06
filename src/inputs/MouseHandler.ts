import { LeftMouseEvent, ProcessInputEvent, RightMouseEvent } from "../events";
import { Tiles } from "../flavours";
import { xy } from "../tools/xy";
import { Listener } from "../types/Dispatcher";
import Game from "../types/Game";
import XY from "../types/XY";

export default class MouseHandler {
  left: boolean;
  right: boolean;
  position: XY<Tiles>;

  constructor(private g: Game) {
    this.left = false;
    this.right = false;
    this.position = xy(NaN, NaN);

    g.canvas.addEventListener("pointerdown", this.onUpdate, { passive: true });
    g.canvas.addEventListener("pointerup", this.onUpdate, { passive: true });
    g.canvas.addEventListener("pointermove", this.onUpdate, { passive: true });
    g.canvas.addEventListener("pointerout", this.onReset, { passive: true });
    g.canvas.addEventListener("contextmenu", (e) => e.preventDefault());
    g.addEventListener("ProcessInput", this.onProcessInput, { passive: true });
  }

  onUpdate = (e: PointerEvent) => {
    this.left = !!(e.buttons & 1);
    this.right = !!(e.buttons & 2);
    this.position = this.g.camera.screenToWorld({ x: e.x, y: e.y });
  };

  onReset = () => {
    this.left = false;
    this.right = false;
    this.position = xy(NaN, NaN);
  };

  onProcessInput: Listener<ProcessInputEvent> = () => {
    if (this.left) this.g.dispatchEvent(new LeftMouseEvent(this.position));
    if (this.right) this.g.dispatchEvent(new RightMouseEvent(this.position));
  };
}
