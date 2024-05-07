import { FallenSpriteSheet } from "../animations/Fallen";
import ResourceManager from "../components/ResourceManager";
import { TickEvent } from "../events";
import { Radians, Tiles } from "../flavours";
import euclideanDistance from "../tools/euclideanDistance";
import { betweenXY, xy } from "../tools/xy";
import { Listener } from "../types/Dispatcher";
import Drawable from "../types/Drawable";
import GameEvents from "../types/GameEvents";
import XY from "../types/XY";
import EntityBase from "./EntityBase";
import Player from "./Player";

export default class Fallen extends EntityBase<"idle" | "move"> {
  constructor(
    e: GameEvents,
    private player: Player,
    render: Set<Drawable>,
    res: ResourceManager,
    position: XY<Tiles> = xy(0, 0),
    heading: Radians = 0,
    public attackRange: Tiles = 1,
  ) {
    super(
      e,
      res,
      render,
      FallenSpriteSheet,
      "idle",
      ["move"],
      position,
      1,
      1,
      heading,
    );

    e.addEventListener("Tick", this.onTick, { passive: true });
  }

  onTick: Listener<TickEvent> = () => {
    const { position, player, radius, attackRange } = this;

    this.heading = betweenXY(player.position, position);

    const distance = euclideanDistance(player.position, position);
    const moving = distance > player.radius + radius + attackRange;

    this.animate(moving ? "move" : "idle");
  };
}
