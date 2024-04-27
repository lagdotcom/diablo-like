import { TickEvent } from "../events";
import {
  Milliseconds,
  Pixels,
  PixelsPerMillisecond,
  Radians,
} from "../flavours";
import makeCylinderPath from "../tools/makeCylinderPath";
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
    public position: XY<Pixels>,
    public angle: Radians,
    public velocity: PixelsPerMillisecond,
    public radius: Pixels,
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
    const move = (this.velocity * step) as Pixels;
    this.position = addXY(this.position, vectorXY(this.angle, move));
  };

  draw(ctx: CanvasRenderingContext2D, o: XY<Pixels>): void {
    const path = makeCylinderPath(o.x, o.y, this.radius, this.radius);

    ctx.fillStyle = "red";
    ctx.fill(path);

    ctx.strokeStyle = "orange";
    ctx.stroke(path);
  }
}
