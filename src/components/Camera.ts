import { CanvasResizeEvent, RenderEvent, TickEvent } from "../events";
import { Pixels } from "../flavours";
import { Listener } from "../types/Dispatcher";
import Game from "../types/Game";

export default class Camera {
  width: Pixels;
  height: Pixels;
  x: Pixels;
  y: Pixels;

  constructor(private g: Game) {
    this.width = g.size.width;
    this.height = g.size.height;
    this.x = g.player.x;
    this.y = g.player.y;

    g.size.addEventListener("CanvasResize", this.onResize, { passive: true });
    g.addEventListener("Tick", this.onTick, { passive: true });
    g.addEventListener("Render", this.onRender, { passive: true });
  }

  get left(): Pixels {
    return this.x - this.width / 2;
  }
  get right(): Pixels {
    return this.x + this.width / 2;
  }
  get top(): Pixels {
    return this.y - this.height / 2;
  }
  get bottom(): Pixels {
    return this.y + this.height / 2;
  }

  onResize: Listener<CanvasResizeEvent> = ({ detail: { width, height } }) => {
    this.width = width;
    this.height = height;
  };

  onTick: Listener<TickEvent> = () => {
    // TODO
  };

  onRender: Listener<RenderEvent> = ({ detail: { ctx } }) => {
    const { left, top } = this;

    for (const r of this.g.render) {
      const ox: Pixels = r.x - left;
      const oy: Pixels = r.y - top;

      // TODO clip to camera
      r.draw(ctx, ox, oy);
    }
  };
}
