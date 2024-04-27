import { LeftMouseEvent, RightMouseEvent, TickEvent } from "../events";
import { Pixels } from "../flavours";
import { addXY, xy } from "../tools/xy";
import { Listener } from "../types/Dispatcher";
import Game from "../types/Game";
import XY from "../types/XY";

export default class MouseHandler {
  left: boolean;
  right: boolean;
  position: XY<Pixels>;

  constructor(private g: Game) {
    this.left = false;
    this.right = false;
    this.position = xy(NaN, NaN);

    g.canvas.addEventListener("mousedown", this.onUpdate);
    g.canvas.addEventListener("mouseup", this.onUpdate);
    g.canvas.addEventListener("mousemove", this.onUpdate);
    g.canvas.addEventListener("mouseout", this.onReset, { passive: true });
    g.canvas.addEventListener("contextmenu", (e) => e.preventDefault());
    g.addEventListener("Tick", this.onTick, { passive: true });
  }

  onUpdate = (e: MouseEvent) => {
    this.left = !!(e.buttons & 1);
    this.right = !!(e.buttons & 2);
    this.position = xy(e.x, e.y);

    if (this.right) e.preventDefault();
  };

  onReset = () => {
    this.left = false;
    this.right = false;
  };

  onTick: Listener<TickEvent> = () => {
    const absolute = addXY(this.position, this.g.camera.offset);

    if (this.left) this.g.dispatchEvent(new LeftMouseEvent(absolute));
    if (this.right) this.g.dispatchEvent(new RightMouseEvent(absolute));
  };
}
