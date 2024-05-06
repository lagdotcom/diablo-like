import { CanvasResizeEvent, RenderEvent, TickEvent } from "../events";
import { Milliseconds, Pixels } from "../flavours";
import setFont from "../tools/setFont";
import { Listener } from "../types/Dispatcher";
import Game from "../types/Game";

export default class FPSCounter {
  steps: Milliseconds[];
  x: Pixels;
  y: Pixels;

  constructor(
    g: Game,
    public samples = 10,
  ) {
    this.steps = [];
    this.x = g.size.width - 8;
    this.y = g.size.height - 8;

    g.size.addEventListener("CanvasResize", this.onResize, { passive: true });
    g.addEventListener("Tick", this.onTick, { passive: true });
    g.addEventListener("Render", this.onRender, { passive: true });
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
    if (!flags.showFPS) return;

    const { fps, x, y } = this;
    setFont(ctx, "24px sans-serif", "yellow", "end", "bottom");
    ctx.fillText(Math.round(fps).toString(), x, y);
  };
}
