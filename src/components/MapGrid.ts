import { RenderEvent } from "../events";
import { WorldU } from "../flavours";
import { subXY } from "../tools/xy";
import { Listener } from "../types/Dispatcher";
import Game from "../types/Game";

export default class MapGrid {
  constructor(
    private g: Game,
    public size: WorldU = 50,
  ) {
    g.addEventListener("Render", this.onRender, { passive: true });
  }

  onRender: Listener<RenderEvent> = ({ detail: { ctx } }) => {
    const { g, size } = this;
    const { camera, projection } = g;
    const sw = g.size.width / 2;
    const sh = g.size.height / 2;

    const tl = projection.screenToWorld({ x: -sw, y: -sh });
    const tr = projection.screenToWorld({ x: sw, y: -sh });
    const br = projection.screenToWorld({ x: sw, y: sh });
    const bl = projection.screenToWorld({ x: -sw, y: sh });

    const minX = Math.min(tl.x, tr.x, br.x, bl.x);
    const maxX = Math.max(tl.x, tr.x, br.x, bl.x);
    const minY = Math.min(tl.y, tr.y, br.y, bl.y);
    const maxY = Math.max(tl.y, tr.y, br.y, bl.y);

    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = "cyan";

    for (let y = minY; y <= maxY; y += size) {
      const a = subXY(projection.worldToScreen({ x: minX, y }), camera.offset);
      const b = subXY(projection.worldToScreen({ x: maxX, y }), camera.offset);

      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    for (let x = minX; x <= maxX; x += size) {
      const a = subXY(projection.worldToScreen({ x, y: minY }), camera.offset);
      const b = subXY(projection.worldToScreen({ x, y: maxY }), camera.offset);

      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  };
}
