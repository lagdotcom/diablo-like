import { TickEvent } from "../events";
import {
  Milliseconds,
  Pixels,
  Radians,
  WorldU,
  WorldUsPerMillisecond,
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
    public position: XY<WorldU>,
    public angle: Radians,
    public velocity: WorldUsPerMillisecond,
    public radius: WorldU,
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
    const move = (this.velocity * step) as WorldU;
    this.position = addXY(this.position, vectorXY(this.angle, move));
  };

  draw(ctx: CanvasRenderingContext2D, o: XY<Pixels>): void {
    const path = makeCylinderPath(
      this.g.projection,
      o.x,
      o.y - 20,
      this.radius,
      this.radius,
    );

    ctx.fillStyle = "red";
    ctx.fill(path);

    ctx.strokeStyle = "orange";
    ctx.stroke(path);
  }
}
