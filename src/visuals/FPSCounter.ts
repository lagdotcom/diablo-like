import CanvasResizer from "../components/CanvasResizer";
import { CanvasResizeEvent, RenderEvent, TickEvent } from "../events";
import { Milliseconds, Pixels } from "../flavours";
import setFont from "../tools/setFont";
import { Listener } from "../types/Dispatcher";
import GameEvents from "../types/GameEvents";

export default class FPSCounter {
  steps: Milliseconds[];
  x: Pixels;
  y: Pixels;

  constructor(
    e: GameEvents,
    size: CanvasResizer,
    public samples = 10,
  ) {
    this.steps = [];
    this.x = size.width - 8;
    this.y = size.height - 8;

    size.addEventListener("CanvasResize", this.onResize, { passive: true });
    e.addEventListener("Tick", this.onTick, { passive: true });
    e.addEventListener("Render", this.onRender, { passive: true });
  }

  get fps() {
    if (this.steps.length === 0) return 0;
    return 1000 / (this.steps.reduce((p, c) => p + c, 0) / this.steps.length);
  }

  onResize: Listener<CanvasResizeEvent> = ({ detail: { width, height } }) => {
    this.x = width - 8;
    this.y = height - 8;
  };

  onTick: Listener<TickEvent> = ({ detail: { step } }) => {
    this.steps.push(step);
    if (this.steps.length > this.samples) this.steps.shift();
  };

  onRender: Listener<RenderEvent> = ({ detail: { ctx, flags } }) => {
    if (!flags.fps) return;

    const { fps, x, y } = this;
    setFont(ctx, "24px sans-serif", "yellow", "end", "bottom");
    ctx.fillText(Math.round(fps).toString(), x, y);
  };
}
