import { TickEvent } from "../events";
import {
  Milliseconds,
  Pixels,
  Radians,
  Tiles,
  TilesPerMillisecond,
} from "../flavours";
import makeTilePath from "../tools/makeTilePath";
import { addXY, vectorXY } from "../tools/xy";
import { Listener } from "../types/Dispatcher";
import Drawable from "../types/Drawable";
import GameEvents from "../types/GameEvents";
import DebugFlags from "../types/DebugFlags";
import XY from "../types/XY";
import Camera from "../visuals/Camera";
import FuseManager, { Fuse } from "./FuseManager";

export default class PlayerShot implements Drawable {
  removeTimer: Fuse;

  constructor(
    private e: GameEvents,
    fuse: FuseManager,
    private render: Set<Drawable>,
    public position: XY<Tiles>,
    public angle: Radians,
    public velocity: TilesPerMillisecond,
    public radius: Tiles,
    timeToLive: Milliseconds,
  ) {
    render.add(this);
    this.removeTimer = fuse.add(timeToLive, this.onRemove);

    e.addEventListener("Tick", this.onTick, { passive: true });
  }

  onRemove = () => {
    this.render.delete(this);
    this.e.removeEventListener("Tick", this.onTick);
  };

  onTick: Listener<TickEvent> = ({ detail: { step } }) => {
    const move = (this.velocity * step) as Tiles;
    this.position = addXY(this.position, vectorXY(this.angle, move));
  };

  draw(
    ctx: CanvasRenderingContext2D,
    offset: XY<Pixels>,
    flags: DebugFlags,
    camera: Camera,
  ) {
    // TODO replace with sprite someday
    const path = makeTilePath(camera, this.position);
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = "red";
    ctx.fill(path);
    ctx.strokeStyle = "orange";
    ctx.stroke(path);
  }
}
