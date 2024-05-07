import { TickEvent } from "../events";
import { Milliseconds } from "../flavours";
import { Listener } from "../types/Dispatcher";
import GameEvents from "../types/GameEvents";

export interface Fuse {
  active: boolean;
  left: Milliseconds;
  callback(): void;
}

export default class FuseManager {
  fuses: Set<Fuse>;

  constructor(e: GameEvents) {
    this.fuses = new Set();

    e.addEventListener("Tick", this.onTick);
  }

  add(time: Milliseconds, callback: Fuse["callback"]) {
    const fuse: Fuse = { left: time, callback, active: true };
    this.fuses.add(fuse);

    return fuse;
  }

  onTick: Listener<TickEvent> = ({ detail: { step } }) => {
    for (const fuse of this.fuses) {
      fuse.left -= step;
      if (fuse.left <= 0) {
        fuse.active = false;
        fuse.callback();
        this.fuses.delete(fuse);
      }
    }
  };
}
