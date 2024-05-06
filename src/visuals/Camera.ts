import { CanvasResizeEvent, RenderEvent } from "../events";
import { Pixels, PixelsPerTile, Tiles } from "../flavours";
import setFont from "../tools/setFont";
import { addXY, printXY, roundXY, subXY, xy } from "../tools/xy";
import { Listener } from "../types/Dispatcher";
import Drawable from "../types/Drawable";
import Game from "../types/Game";
import XY from "../types/XY";

interface DrawInstruction {
  object: Drawable;
  offset: XY<Pixels>;
}

export default class IsometricCamera {
  size!: XY<Pixels>;
  offset!: XY<Pixels>;

  constructor(
    private g: Game,
    private focusedObject = g.player,
    public tileSize: PixelsPerTile = 32,
  ) {
    this.resize(g.size.width, g.size.height);

    g.size.addEventListener("CanvasResize", this.onResize, { passive: true });
    g.addEventListener("Render", this.onRender, { passive: true });
  }

  private resize(width: Pixels, height: Pixels) {
    this.size = xy(width, height);
    this.offset = xy(width / 2, height / 2);
  }

  get focus() {
    return this.focusedObject.position;
  }

  get renderList() {
    const list: DrawInstruction[] = [];

    for (const object of this.g.render) {
      const offset = this.worldToScreen(object.position);

      // TODO clip to camera

      list.push({ object, offset });
    }

    return list.sort((a, b) => a.offset.y - b.offset.y);
  }

  onResize: Listener<CanvasResizeEvent> = ({ detail: { width, height } }) => {
    this.resize(width, height);
  };

  onRender: Listener<RenderEvent> = ({ detail: { ctx, flags } }) => {
    const { renderList } = this;

    for (const { object, offset } of renderList)
      object.draw(ctx, offset, flags);

    if (flags.cameraDebug) {
      const { g, focus } = this;

      ctx.globalAlpha = 1;
      setFont(ctx, "12px sans-serif", "white", "left", "top");

      const x = g.size.width - 120;
      let y = 100;
      ctx.fillText(`offset: ${printXY(this.offset)}`, x, (y += 20));
      ctx.fillText(`focus: ${printXY(focus)}`, x, (y += 20));
      ctx.fillText(`mouse: ${printXY(g.mouse.position)}`, x, (y += 20));
    }
  };

  screenToWorld(screen: XY<Pixels>): XY<Tiles> {
    const { x: sx, y: sy } = subXY(screen, this.offset);
    const x: Tiles = (2 * sy + sx) / (2 * this.tileSize);
    const y: Tiles = (2 * sy - sx) / (2 * this.tileSize);
    return roundXY(addXY({ x, y }, this.focus));
  }

  worldToScreen(world: XY<Tiles>): XY<Pixels> {
    const { x: wx, y: wy } = subXY(world, this.focus);
    const x: Pixels = (wx - wy) * this.tileSize;
    const y: Pixels = ((wx + wy) * this.tileSize) / 2;
    return addXY({ x, y }, this.offset);
  }
}
