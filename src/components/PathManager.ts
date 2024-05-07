import EntityBase from "../entities/EntityBase";
import Player from "../entities/Player";
import { Tiles } from "../flavours";
import { getAStarPath } from "../pathfinding/astar";
import GridLocation from "../pathfinding/GridLocation";
import Cached from "../tools/Cached";
import { eqRoundXY, eqXY, invalidXY, xy } from "../tools/xy";
import Option from "../types/Option";
import XY from "../types/XY";

interface AStarPathResult {
  tiles: XY<Tiles>[];
  costSoFar: Map<GridLocation, number>;
}

export default class PathManager {
  private destination: XY<Tiles>;
  private enemyPositions: Cached<Set<XY<Tiles>>>;
  private path: Cached<Option<AStarPathResult>>;
  private position: XY<Tiles>;

  constructor(
    private player: Player,
    private enemies: Set<EntityBase>,
  ) {
    this.destination = xy(NaN, NaN);
    this.position = xy(NaN, NaN);
    this.enemyPositions = new Cached(this.generateEnemyPositions);
    this.path = new Cached(this.generatePlayerPath);
  }

  getPlayerPath(destination: XY<Tiles>) {
    if (!eqXY(this.position, this.player.positionRounded)) {
      this.position = this.player.positionRounded;
      this.path.clear();
    }

    if (!eqRoundXY(this.destination, destination)) {
      this.destination = destination;
      this.path.clear();
    }

    return this.path.get();
  }

  private generateEnemyPositions = () =>
    new Set(Array.from(this.enemies, (e) => e.positionRounded));

  private generatePlayerPath = () => {
    const { enemyPositions, destination, position } = this;

    if (invalidXY(destination) || invalidXY(position)) return;

    return getAStarPath(enemyPositions.get(), position, destination);
  };
}
