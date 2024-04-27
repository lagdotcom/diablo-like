import { CanvasResizeEvent, RenderEvent } from "../events";
import { Pixels } from "../flavours";
import { subXY, xy } from "../tools/xy";
import { Listener } from "../types/Dispatcher";
import Game from "../types/Game";
import XY from "../types/XY";

export default class Camera {
  size: XY<Pixels>;
  position: XY<Pixels>;

  constructor(private g: Game) {
    this.size = g.size.xy;
    this.position = g.player.position;

    g.size.addEventListener("CanvasResize", this.onResize, { passive: true });
    g.addEventListener("Render", this.onRender, { passive: true });
  }

  get halfSize() {
    return xy<Pixels>(this.size.x / 2, this.size.y / 2);
  }

  get offset() {
    return subXY(this.position, this.halfSize);
  }

  onResize: Listener<CanvasResizeEvent> = ({ detail: { width, height } }) => {
    this.size = xy(width, height);
  };

  onRender: Listener<RenderEvent> = ({ detail: { ctx } }) => {
    // TODO improve this
    for (const r of this.g.render) {
      const offset = subXY(r.position, this.offset);

      // TODO clip to camera
      r.draw(ctx, offset);
    }
  };
}
