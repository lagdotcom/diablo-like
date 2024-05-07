import CanvasResizer from "../components/CanvasResizer";
import DebugManager from "../components/DebugManager";
import EntityBase from "../entities/EntityBase";
import { CanvasResizeEvent, RenderEvent, TickEvent } from "../events";
import { Pixels, PixelsPerTile, Tiles } from "../flavours";
import { addXY, printXY, roundXY, subXY, xy } from "../tools/xy";
import { Listener } from "../types/Dispatcher";
import Drawable from "../types/Drawable";
import GameEvents from "../types/GameEvents";
import XY from "../types/XY";

interface DrawInstruction {
  object: Drawable;
  offset: XY<Pixels>;
}

export default class Camera {
  size!: XY<Pixels>;
  offset!: XY<Pixels>;

  constructor(
    e: GameEvents,
    private debug: DebugManager,
    private focusedObject: EntityBase,
    private render: Set<Drawable>,
    resizer: CanvasResizer,
    public tileSize: PixelsPerTile = 32,
  ) {
    this.resize(resizer.width, resizer.height);

    resizer.addEventListener("CanvasResize", this.onResize, { passive: true });
    e.addEventListener("Tick", this.onTick, { passive: true });
    e.addEventListener("Render", this.onRender, { passive: true });
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

    for (const object of this.render) {
      const offset = this.worldToScreen(object.position);

      // TODO clip to camera

      list.push({ object, offset });
    }

    return list.sort((a, b) => a.offset.y - b.offset.y);
  }

  onResize: Listener<CanvasResizeEvent> = ({ detail: { width, height } }) => {
    this.resize(width, height);
  };

  onTick: Listener<TickEvent> = () => {
    const { debug, focus } = this;

    if (debug.flags.camera) {
      debug.add(`offset: ${printXY(this.offset)}`);
      debug.add(`focus: ${printXY(focus)}`);
    }
  };

  onRender: Listener<RenderEvent> = ({ detail: { ctx, flags } }) => {
    const { renderList } = this;

    for (const { object, offset } of renderList)
      object.draw(ctx, offset, flags, this);
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
