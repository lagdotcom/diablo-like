import {
  JoypadButtonEvent,
  JoypadMoveEvent,
  LeftMouseEvent,
  RightMouseEvent,
  TickEvent,
} from "../events";
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

type PlayerAttack =
  | { type: "mouse"; target: XY<Pixels> }
  | { type: "pad"; angle: Radians };

type PlayerMove =
  | { type: "mouse"; target: XY<Pixels> }
  | { type: "pad"; angle: Radians };

export default class Player implements Drawable {
  attack?: PlayerAttack;
  move?: PlayerMove;

  attacking?: Fuse;
  canMove: boolean;

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
    g.addEventListener("JoypadButton", this.onJoypadButton, { passive: true });
    g.addEventListener("JoypadMove", this.onJoypadMove, { passive: true });
    g.addEventListener("Tick", this.onTick, { passive: true });
  }

  onLeft: Listener<LeftMouseEvent> = ({ detail }) => {
    if (euclideanDistance(this.position, detail) > this.radius)
      this.move = { type: "mouse", target: detail };
  };

  onRight: Listener<RightMouseEvent> = ({ detail }) => {
    this.attack = { type: "mouse", target: detail };
  };

  onJoypadMove: Listener<JoypadMoveEvent> = ({ detail }) => {
    this.move = { type: "pad", angle: detail };
    this.heading = detail; // is this bad?
  };

  onJoypadButton: Listener<JoypadButtonEvent> = ({ detail }) => {
    if (detail === 0) this.attack = { type: "pad", angle: this.heading };
  };

  onTick: Listener<TickEvent> = ({ detail: { step } }) => {
    const { position, moveSpeed, attacking, attack, move } = this;

    if (attacking?.active) return;

    if (attack) {
      this.attacking = this.g.fuse.add(this.attackTime, this.onAttackFinish);
      this.g.fuse.add(this.attackDelay, this.onAttackLaunch);
      this.canMove = false;
      return;
    }

    if (move) {
      const maxDistance =
        move.type === "mouse"
          ? euclideanDistance(move.target, position)
          : Infinity;
      const angle =
        move.type === "mouse" ? betweenXY(move.target, position) : move.angle;
      const amount = Math.min(maxDistance, (moveSpeed * step) as Pixels);

      this.heading = angle;
      this.position = addXY(position, vectorXY(angle, amount));

      if (maxDistance <= amount || move.type === "pad") this.move = undefined;
    }
  };

  onAttackLaunch = () => {
    const { attack, position } = this;

    if (attack) {
      new PlayerShot(
        this.g,
        this.position,
        attack.type === "mouse"
          ? betweenXY(attack.target, position)
          : attack.angle,
        this.projectileVelocity,
        8,
        3000,
      );
    }
  };

  onAttackFinish = () => {
    this.canMove = true;
    this.attack = undefined;
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
