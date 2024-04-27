import { LeftMouseEvent, RightMouseEvent, TickEvent } from "../events";
import {
  Milliseconds,
  Pixels,
  PixelsPerMillisecond,
  Radians,
} from "../flavours";
import euclideanDistance from "../tools/euclideanDistance";
import makeCylinderPath from "../tools/makeCylinderPath";
import { addXY, betweenXY, vectorXY, xy } from "../tools/xy";
import { Listener } from "../types/Dispatcher";
import Drawable from "../types/Drawable";
import Game from "../types/Game";
import XY from "../types/XY";
import { Fuse } from "./FuseManager";
import PlayerShot from "./PlayerShot";

export default class Player implements Drawable {
  attacking?: Fuse;
  canMove: boolean;
  destination?: XY<Pixels>;
  target?: XY<Pixels>;

  constructor(
    private g: Game,
    public position: XY<Pixels> = xy(0, 0),
    public radius: Pixels = 30,
    public height: Pixels = 70,
    public heading: Radians = 0,
    public moveSpeed: PixelsPerMillisecond = 1,
    public attackDelay: Milliseconds = 200,
    public attackTime: Milliseconds = 600,
    public projectileVelocity: PixelsPerMillisecond = 2,
  ) {
    this.canMove = true;
    g.render.add(this);

    g.addEventListener("LeftMouse", this.onLeft, { passive: true });
    g.addEventListener("RightMouse", this.onRight, { passive: true });
    g.addEventListener("Tick", this.onTick, { passive: true });
  }

  onLeft: Listener<LeftMouseEvent> = ({ detail }) => {
    if (this.canMove && euclideanDistance(this.position, detail) > this.radius)
      this.destination = detail;
  };

  onRight: Listener<RightMouseEvent> = ({ detail }) => {
    this.destination = undefined;
    this.target = detail;
  };

  onTick: Listener<TickEvent> = ({ detail: { step } }) => {
    const { position, moveSpeed, attacking, target, destination } = this;

    if (attacking?.active) return;

    if (target) {
      this.attacking = this.g.fuse.add(this.attackTime, this.onAttackFinish);
      this.g.fuse.add(this.attackDelay, this.onAttackLaunch);
      this.canMove = false;
    }

    if (destination) {
      const distance = euclideanDistance(position, destination);
      const angle = betweenXY(destination, position);
      const move = Math.min(distance, (moveSpeed * step) as Pixels);

      this.heading = angle;
      this.position = addXY(position, vectorXY(angle, move));

      if (distance <= move) this.destination = undefined;
    }
  };

  onAttackLaunch = () => {
    if (this.target) {
      new PlayerShot(
        this.g,
        this.position,
        betweenXY(this.target, this.position),
        this.projectileVelocity,
        8,
        3000,
      );
    }
  };

  onAttackFinish = () => {
    this.canMove = true;
    this.target = undefined;
  };

  draw(ctx: CanvasRenderingContext2D, o: XY<Pixels>) {
    const path = makeCylinderPath(o.x, o.y, this.radius, this.height);

    ctx.fillStyle = "blue";
    ctx.fill(path);

    ctx.strokeStyle = "skyblue";
    ctx.lineWidth = 2;
    ctx.stroke(path);
  }
}
