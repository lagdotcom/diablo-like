import { CanvasResizeEvent, RenderEvent } from "../events";
import { Pixels } from "../flavours";
import { subXY, xy } from "../tools/xy";
import { Listener } from "../types/Dispatcher";
import Drawable from "../types/Drawable";
import Game from "../types/Game";
import XY from "../types/XY";

export default class Camera {
  size: XY<Pixels>;
  focus: XY<Pixels>;

  constructor(private g: Game) {
    this.size = g.size.xy;
    this.focus = g.projection.worldToScreen(g.player.position);

    g.size.addEventListener("CanvasResize", this.onResize, { passive: true });
    g.addEventListener("Render", this.onRender, { passive: true });
  }

  get halfSize() {
    return xy<Pixels>(this.size.x / 2, this.size.y / 2);
  }

  get offset() {
    return subXY(this.focus, this.halfSize);
  }

  get renderList() {
    const list: Drawable[] = [];

    for (const r of this.g.render) {
      // TODO clip to camera
      list.push(r);
    }

    return list.sort((a, b) => a.position.y - b.position.y);
  }

  onResize: Listener<CanvasResizeEvent> = ({ detail: { width, height } }) => {
    this.size = xy(width, height);
  };

  onRender: Listener<RenderEvent> = ({ detail: { ctx, flags } }) => {
    const { renderList, g, offset } = this;

    for (const r of renderList) {
      const screen = subXY(g.projection.worldToScreen(r.position), offset);
      r.draw(ctx, screen, flags);
    }
  };
}
