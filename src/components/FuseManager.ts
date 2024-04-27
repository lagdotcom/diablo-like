import { TickEvent } from "../events";
import { Milliseconds } from "../flavours";
import { Listener } from "../types/Dispatcher";
import Game from "../types/Game";

export interface Fuse {
  active: boolean;
  left: Milliseconds;
  callback(): void;
}

export default class FuseManager {
  fuses: Set<Fuse>;

  constructor(g: Game) {
    this.fuses = new Set();

    g.addEventListener("Tick", this.onTick);
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
