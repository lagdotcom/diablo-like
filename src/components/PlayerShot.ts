import { TickEvent } from "../events";
import { Milliseconds, Radians, Tiles, TilesPerMillisecond } from "../flavours";
import makeTilePath from "../tools/makeTilePath";
import { addXY, vectorXY } from "../tools/xy";
import { Listener } from "../types/Dispatcher";
import Drawable from "../types/Drawable";
import Game from "../types/Game";
import XY from "../types/XY";
import { Fuse } from "./FuseManager";

export default class PlayerShot implements Drawable {
  removeTimer: Fuse;

  constructor(
    private g: Game,
    public position: XY<Tiles>,
    public angle: Radians,
    public velocity: TilesPerMillisecond,
    public radius: Tiles,
    timeToLive: Milliseconds,
  ) {
    g.render.add(this);
    this.removeTimer = g.fuse.add(timeToLive, this.onRemove);

    g.addEventListener("Tick", this.onTick, { passive: true });
  }

  onRemove = () => {
    this.g.render.delete(this);
    this.g.removeEventListener("Tick", this.onTick);
  };

  onTick: Listener<TickEvent> = ({ detail: { step } }) => {
    const move = (this.velocity * step) as Tiles;
    this.position = addXY(this.position, vectorXY(this.angle, move));
  };

  draw(ctx: CanvasRenderingContext2D): void {
    const path = makeTilePath(this.g.camera, this.position);
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = "red";
    ctx.fill(path);
    ctx.strokeStyle = "orange";
    ctx.stroke(path);
  }
}
