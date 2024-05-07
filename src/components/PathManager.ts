import { Tiles } from "../flavours";
import { getAStarPath } from "../pathfinding/astar";
import GridLocation from "../pathfinding/GridLocation";
import Cached from "../tools/Cached";
import { eqRoundXY, eqXY, invalidXY, xy } from "../tools/xy";
import Game from "../types/Game";
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

  constructor(private g: Game) {
    this.destination = xy(NaN, NaN);
    this.position = xy(NaN, NaN);
    this.enemyPositions = new Cached(this.generateEnemyPositions);
    this.path = new Cached(this.generatePlayerPath);
  }

  getPlayerPath(destination: XY<Tiles>) {
    if (!eqXY(this.position, this.g.player.positionRounded)) {
      this.position = this.g.player.positionRounded;
      this.path.clear();
    }

    if (!eqRoundXY(this.destination, destination)) {
      this.destination = destination;
      this.path.clear();
    }

    return this.path.get();
  }

  private generateEnemyPositions = () =>
    new Set(Array.from(this.g.enemies, (e) => e.positionRounded));

  private generatePlayerPath = () => {
    const { enemyPositions, destination, position } = this;

    if (invalidXY(destination) || invalidXY(position)) return;

    return getAStarPath(enemyPositions.get(), position, destination);
  };
}
