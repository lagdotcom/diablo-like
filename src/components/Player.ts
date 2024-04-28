import {
  AttackOver,
  AttackRelease,
  RogueSpriteSheet,
} from "../animations/Rogue";
import {
  AnimationTriggerEvent,
  JoypadButtonEvent,
  JoypadMoveEvent,
  LeftMouseEvent,
  RightMouseEvent,
  TickEvent,
} from "../events";
import { Pixels, PixelsPerMillisecond, Radians } from "../flavours";
import euclideanDistance from "../tools/euclideanDistance";
import getOctant from "../tools/getOctant";
import { addXY, betweenXY, vectorXY, xy } from "../tools/xy";
import { Listener } from "../types/Dispatcher";
import Drawable from "../types/Drawable";
import Game from "../types/Game";
import XY from "../types/XY";
import AnimationController from "./AnimationController";
import PlayerShot from "./PlayerShot";

type PlayerAttack =
  | { type: "mouse"; target: XY<Pixels> }
  | { type: "pad"; angle: Radians };

type PlayerMove =
  | { type: "mouse"; target: XY<Pixels> }
  | { type: "pad"; angle: Radians };

type AnimationPrefix = "fire" | "move" | "idle";

export default class Player implements Drawable {
  attacking: boolean;
  attack?: PlayerAttack;
  move?: PlayerMove;

  anim: AnimationController;
  prefix: AnimationPrefix;

  constructor(
    private g: Game,
    public position: XY<Pixels> = xy(0, 0),
    public radius: Pixels = 25,
    public height: Pixels = 55,
    public heading: Radians = 0,
    public moveSpeed: PixelsPerMillisecond = 0.6,
    public projectileVelocity: PixelsPerMillisecond = 1.4,
  ) {
    this.anim = new AnimationController(g, RogueSpriteSheet, "idle2");
    this.prefix = "idle";
    this.attacking = false;

    g.render.add(this);

    g.addEventListener("LeftMouse", this.onLeft, { passive: true });
    g.addEventListener("RightMouse", this.onRight, { passive: true });
    g.addEventListener("JoypadButton", this.onJoypadButton, { passive: true });
    g.addEventListener("JoypadMove", this.onJoypadMove, { passive: true });
    g.addEventListener("Tick", this.onTick, { passive: true });

    g.addEventListener("AnimationTrigger", this.onAnimationTrigger, {
      passive: true,
    });
  }

  private animate(prefix: AnimationPrefix) {
    const octant = getOctant(this.heading);
    const id = `${prefix}${octant}`;

    if (prefix === "fire" || this.prefix === "fire") this.anim.play(id);
    else this.anim.shift(id);

    this.prefix = prefix;
  }

  onLeft: Listener<LeftMouseEvent> = ({ detail }) => {
    if (euclideanDistance(detail, this.position) > this.radius)
      this.move = { type: "mouse", target: detail };
    else this.heading = betweenXY(detail, this.position);
  };

  onRight: Listener<RightMouseEvent> = ({ detail }) => {
    if (!this.attacking) this.attack = { type: "mouse", target: detail };
  };

  onJoypadMove: Listener<JoypadMoveEvent> = ({ detail }) => {
    this.move = { type: "pad", angle: detail };
    this.heading = detail; // is this bad?
  };

  onJoypadButton: Listener<JoypadButtonEvent> = ({ detail }) => {
    if (detail === 0 && !this.attacking)
      this.attack = { type: "pad", angle: this.heading };
  };

  get canAct() {
    return !this.attacking;
  }

  onTick: Listener<TickEvent> = ({ detail: { step } }) => {
    const { position, moveSpeed, attack, move } = this;

    if (!this.canAct) return;

    if (attack) {
      this.heading =
        attack.type === "mouse"
          ? betweenXY(attack.target, position)
          : attack.angle;
      this.animate("fire");
      this.attacking = true;
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

  onAnimationTrigger: Listener<AnimationTriggerEvent> = ({
    detail: { controller, trigger },
  }) => {
    if (controller === this.anim)
      switch (trigger) {
        case AttackRelease:
          return this.onAttackLaunch();
        case AttackOver:
          return this.onAttackFinish();
      }
  };

  onAttackLaunch = () => {
    const { attack, position } = this;

    if (attack)
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
  };

  onAttackFinish = () => {
    this.attacking = false;
    this.attack = undefined;
    this.animate("idle");
  };

  draw(ctx: CanvasRenderingContext2D, o: XY<Pixels>) {
    if (!this.attacking) this.animate(this.move ? "move" : "idle");
    this.anim.draw(ctx, o);

    // const path = makeCylinderPath(o.x, o.y, this.radius, this.height);
    // ctx.globalAlpha = 0.1;

    // ctx.fillStyle = "blue";
    // ctx.fill(path);

    // ctx.strokeStyle = "skyblue";
    // ctx.lineWidth = 2;
    // ctx.stroke(path);

    // ctx.globalAlpha = 1;
  }
}
