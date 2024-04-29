import { FallenSpriteSheet } from "../animations/Fallen";
import { TickEvent } from "../events";
import { Pixels, Radians } from "../flavours";
import euclideanDistance from "../tools/euclideanDistance";
import { betweenXY, xy } from "../tools/xy";
import { Listener } from "../types/Dispatcher";
import Game from "../types/Game";
import XY from "../types/XY";
import EntityBase from "./EntityBase";

export default class Fallen extends EntityBase<"idle" | "move"> {
  constructor(
    g: Game,
    position: XY<Pixels> = xy(0, 0),
    heading: Radians = 0,
    public attackRange: Pixels = 20,
  ) {
    super(g, FallenSpriteSheet, "idle", ["move"], position, 20, 25, heading);

    g.addEventListener("Tick", this.onTick, { passive: true });
  }

  onTick: Listener<TickEvent> = () => {
    const player = this.g.player;

    this.heading = betweenXY(player.position, this.position);

    const distance = euclideanDistance(player.position, this.position);
    const moving = distance > player.radius + this.radius + this.attackRange;

    this.animate(moving ? "move" : "idle");
  };
}
