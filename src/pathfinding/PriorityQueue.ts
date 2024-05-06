import GridLocation from "./GridLocation";

interface PriorityQueueItem {
  location: GridLocation;
  priority: number;
}

export default class PriorityQueue {
  list: PriorityQueueItem[];
  dirty: boolean;

  constructor() {
    this.list = [];
    this.dirty = false;
  }

  put(location: GridLocation, priority: number) {
    this.list.push({ location, priority });
    this.dirty = true;
  }

  sort() {
    this.list.sort((a, b) => a.priority - b.priority);
    this.dirty = false;
  }

  get() {
    if (this.dirty) this.sort();

    const item = this.list.shift();
    if (!item) throw new Error("queue is empty");

    return item.location;
  }

  empty() {
    return this.list.length === 0;
  }
}
