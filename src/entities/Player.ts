import {
  AttackOver,
  AttackRelease,
  RogueSpriteSheet,
} from "../animations/Rogue";
import FuseManager from "../components/FuseManager";
import PlayerShot from "../components/PlayerShot";
import ResourceManager from "../components/ResourceManager";
import {
  AnimationTriggerEvent,
  JoypadButtonEvent,
  JoypadMoveEvent,
  LeftMouseEvent,
  RightMouseEvent,
  TickEvent,
} from "../events";
import { Radians, Tiles, TilesPerMillisecond } from "../flavours";
import euclideanDistance from "../tools/euclideanDistance";
import { tilesPerSecond } from "../tools/units";
import { addXY, betweenXY, eqXY, vectorXY } from "../tools/xy";
import { Listener } from "../types/Dispatcher";
import Drawable from "../types/Drawable";
import GameEvents from "../types/GameEvents";
import XY from "../types/XY";
import EntityBase from "./EntityBase";

type PlayerAttack =
  | { type: "mouse"; target: XY<Tiles> }
  | { type: "pad"; angle: Radians };

type PlayerMove =
  | { type: "mouse"; target: XY<Tiles> }
  | { type: "pad"; angle: Radians };

export default class Player extends EntityBase<"idle" | "move" | "fire"> {
  attacking: boolean;
  attack?: PlayerAttack;
  move?: PlayerMove;

  constructor(
    e: GameEvents,
    private fuse: FuseManager,
    private render: Set<Drawable>,
    res: ResourceManager,
    position: XY<Tiles>,
    heading: Radians = 0,
    public moveSpeed: TilesPerMillisecond = tilesPerSecond(6),
    public projectileVelocity: TilesPerMillisecond = tilesPerSecond(12),
  ) {
    super(
      e,
      res,
      render,
      RogueSpriteSheet,
      "idle",
      ["move", "fire"],
      position,
      1,
      1,
      heading,
    );
    this.attacking = false;

    e.addEventListener("LeftMouse", this.onLeft, { passive: true });
    e.addEventListener("RightMouse", this.onRight, { passive: true });
    e.addEventListener("JoypadButton", this.onJoypadButton, { passive: true });
    e.addEventListener("JoypadMove", this.onJoypadMove, { passive: true });
    e.addEventListener("Tick", this.onTick, { passive: true });

    e.addEventListener("AnimationTrigger", this.onAnimationTrigger, {
      passive: true,
    });
  }

  get canAct() {
    return !this.attacking;
  }

  onLeft: Listener<LeftMouseEvent> = ({ detail }) => {
    if (!eqXY(this.position, detail))
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
      const maxDistance: Tiles =
        move.type === "mouse"
          ? euclideanDistance(move.target, position)
          : Infinity;
      const angle =
        move.type === "mouse" ? betweenXY(move.target, position) : move.angle;
      const amount = Math.min(maxDistance, (moveSpeed * step) as Tiles);

      this.heading = angle;
      this.position = addXY(position, vectorXY(angle, amount));

      if (maxDistance <= amount || move.type === "pad") this.move = undefined;
      else {
        this.animate("move");
        return;
      }
    }
    // else {
    //   this.heading = betweenXY(this.g.mouse.position, position);
    // }

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

  onAttackLaunch() {
    const { attack, position } = this;

    if (attack)
      new PlayerShot(
        this.e,
        this.fuse,
        this.render,
        this.position,
        attack.type === "mouse"
          ? betweenXY(attack.target, position)
          : attack.angle,
        this.projectileVelocity,
        1,
        3000,
      );
  }

  onAttackFinish() {
    this.attacking = false;
    this.attack = undefined;
    this.animate("idle");
  }
}
