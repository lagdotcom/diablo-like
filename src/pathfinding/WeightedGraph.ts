import EntityBase from "../entities/EntityBase";
import { Tiles } from "../flavours";
import GridLocation from "./GridLocation";

const ROOT2 = Math.sqrt(2);

export default class WeightedGraph {
  private locations: Map<string, GridLocation>;
  private blocked: Set<GridLocation>;

  constructor(enemies: Set<EntityBase>) {
    this.locations = new Map();
    this.blocked = new Set(
      Array.from(enemies, (e) =>
        this.at(e.positionRounded.x, e.positionRounded.y),
      ),
    );
  }

  isNavigable(pos: GridLocation) {
    return !this.blocked.has(pos);
  }

  at(x: Tiles, y: Tiles) {
    const tag = `${x},${y}`;
    const old = this.locations.get(tag);
    if (old) return old;

    const loc = new GridLocation(x, y);
    this.locations.set(tag, loc);
    return loc;
  }

  *neighbours(loc: GridLocation) {
    for (let y = -1; y <= 1; y++)
      for (let x = -1; x <= 1; x++) {
        if (x || y) {
          const pos = this.at(loc.x + x, loc.y + y);
          if (this.isNavigable(pos)) yield pos;
        }
      }
  }

  cost(a: GridLocation, b: GridLocation) {
    const ex = a.x !== b.x;
    const ey = a.y !== b.y;

    if (ex && ey) return ROOT2;
    return 1;
  }
}
