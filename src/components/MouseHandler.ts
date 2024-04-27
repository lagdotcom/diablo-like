import { LeftMouseEvent, TickEvent } from "../events";
import { Pixels } from "../flavours";
import { Listener } from "../types/Dispatcher";
import Game from "../types/Game";

export default class MouseHandler {
  left: boolean;
  right: boolean;
  x: Pixels;
  y: Pixels;

  constructor(private g: Game) {
    this.left = false;
    this.right = false;
    this.x = NaN;
    this.y = NaN;

    g.canvas.addEventListener("mousedown", this.onUpdate, { passive: true });
    g.canvas.addEventListener("mouseup", this.onUpdate, { passive: true });
    g.canvas.addEventListener("mousemove", this.onUpdate, { passive: true });
    g.addEventListener("Tick", this.onTick, { passive: true });
  }

  onUpdate = (e: MouseEvent) => {
    this.left = !!(e.buttons & 1);
    this.right = !!(e.buttons & 2);

    this.x = e.x;
    this.y = e.y;
  };

  onTick: Listener<TickEvent> = () => {
    const { left, top } = this.g.camera;

    if (this.left)
      this.g.dispatchEvent(new LeftMouseEvent(this.x + left, this.y + top));
  };
}
