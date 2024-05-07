import CanvasResizer from "../components/CanvasResizer";
import { RenderEvent } from "../events";
import MouseHandler from "../inputs/MouseHandler";
import makeTilePath from "../tools/makeTilePath";
import { Listener } from "../types/Dispatcher";
import GameEvents from "../types/GameEvents";
import Camera from "./Camera";

export default class MapGrid {
  constructor(
    e: GameEvents,
    private camera: Camera,
    private mouse: MouseHandler,
    private size: CanvasResizer,
  ) {
    e.addEventListener("Render", this.onRender, { passive: true });
  }

  onRender: Listener<RenderEvent> = ({ detail: { ctx } }) => {
    const { camera, mouse, size } = this;
    const { width: sw, height: sh } = size;

    const tl = camera.screenToWorld({ x: 0, y: 0 });
    const tr = camera.screenToWorld({ x: sw, y: 0 });
    const br = camera.screenToWorld({ x: sw, y: sh });
    const bl = camera.screenToWorld({ x: 0, y: sh });

    const minX = Math.min(tl.x, tr.x, br.x, bl.x);
    const maxX = Math.max(tl.x, tr.x, br.x, bl.x);
    const minY = Math.min(tl.y, tr.y, br.y, bl.y);
    const maxY = Math.max(tl.y, tr.y, br.y, bl.y);

    ctx.globalAlpha = 0.2;
    ctx.strokeStyle = "cyan";

    for (let y = minY - 0.5; y <= maxY; y++) {
      const a = camera.worldToScreen({ x: minX, y });
      const b = camera.worldToScreen({ x: maxX, y });

      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    for (let x = minX - 0.5; x <= maxX; x++) {
      const a = camera.worldToScreen({ x, y: minY });
      const b = camera.worldToScreen({ x, y: maxY });

      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    const path = makeTilePath(camera, mouse.position);
    ctx.fillStyle = "cyan";
    ctx.fill(path);

    ctx.globalAlpha = 1;
  };
}
