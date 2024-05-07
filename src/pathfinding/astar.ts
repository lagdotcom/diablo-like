import { Tiles } from "../flavours";
import euclideanDistance from "../tools/euclideanDistance";
import isDefined from "../tools/isDefined";
import XY from "../types/XY";
import GridLocation from "./GridLocation";
import PriorityQueue from "./PriorityQueue";
import WeightedGraph from "./WeightedGraph";

class CrashMap<K, V> extends Map<K, V> {
  getOrDie(key: K): V {
    const value = super.get(key);
    if (typeof value === "undefined") throw new Error(`No such key: ${key}`);
    return value;
  }
}

function heuristic(a: GridLocation, b: GridLocation): number {
  return euclideanDistance(a, b);
}

function aStarSearch(
  graph: WeightedGraph,
  start: GridLocation,
  goal: GridLocation,
  max: Tiles,
) {
  const frontier = new PriorityQueue();
  frontier.put(start, 0);
  const cameFrom = new Map<GridLocation, GridLocation>();
  const costSoFar = new CrashMap([[start, 0]]);

  while (!frontier.empty()) {
    const current = frontier.get();

    if (current == goal) break;

    for (const next of graph.neighbours(current)) {
      const newCost = costSoFar.getOrDie(current) + graph.cost(current, next);
      if (newCost > max) continue;

      const nextCost = costSoFar.get(next);

      if (!isDefined(nextCost) || newCost < nextCost) {
        costSoFar.set(next, newCost);
        const priority = newCost + heuristic(next, goal);
        frontier.put(next, priority);
        cameFrom.set(next, current);
      }
    }
  }

  return { cameFrom, costSoFar };
}

export function getAStarPath(
  blocked: Set<XY<Tiles>>,
  from: XY<Tiles>,
  to: XY<Tiles>,
) {
  const graph = new WeightedGraph(blocked);
  const start = graph.at(from.x, from.y);
  const goal = graph.at(to.x, to.y);
  const max: Tiles = euclideanDistance(from, to) + 10;

  const { cameFrom, costSoFar } = aStarSearch(graph, start, goal, max);

  const tiles: XY<Tiles>[] = [];
  let current: GridLocation | undefined = goal;
  while (current) {
    tiles.push(current);
    current = cameFrom.get(current);
  }

  return { tiles, costSoFar };
}
