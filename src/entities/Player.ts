import {
  AttackOver,
  AttackRelease,
  RogueSpriteSheet,
} from "../animations/Rogue";
import PlayerShot from "../components/PlayerShot";
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
import { addXY, betweenXY, vectorXY } from "../tools/xy";
import { Listener } from "../types/Dispatcher";
import Game from "../types/Game";
import XY from "../types/XY";
import EntityBase from "./EntityBase";

type PlayerAttack =
  | { type: "mouse"; target: XY<Pixels> }
  | { type: "pad"; angle: Radians };

type PlayerMove =
  | { type: "mouse"; target: XY<Pixels> }
  | { type: "pad"; angle: Radians };

export default class Player extends EntityBase<"idle" | "move" | "fire"> {
  attacking: boolean;
  attack?: PlayerAttack;
  move?: PlayerMove;

  constructor(
    g: Game,
    position: XY<Pixels>,
    heading: Radians = 0,
    public moveSpeed: PixelsPerMillisecond = 0.6,
    public projectileVelocity: PixelsPerMillisecond = 1.4,
  ) {
    super(
      g,
      RogueSpriteSheet,
      "idle",
      ["move", "fire"],
      position,
      25,
      55,
      heading,
    );
    this.attacking = false;

    g.addEventListener("LeftMouse", this.onLeft, { passive: true });
    g.addEventListener("RightMouse", this.onRight, { passive: true });
    g.addEventListener("JoypadButton", this.onJoypadButton, { passive: true });
    g.addEventListener("JoypadMove", this.onJoypadMove, { passive: true });
    g.addEventListener("Tick", this.onTick, { passive: true });

    g.addEventListener("AnimationTrigger", this.onAnimationTrigger, {
      passive: true,
    });
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
      else {
        this.animate("move");
        return;
      }
    }

    this.animate("idle");
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
}
