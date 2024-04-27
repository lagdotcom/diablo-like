import { Milliseconds, RequestID } from "../flavours";

export type TickFunction = (time: Milliseconds) => void;

export default class GameClock {
  request?: RequestID;
  last: Milliseconds;

  constructor(
    private tick: TickFunction,
    public maxStep: Milliseconds,
    public running = true,
  ) {
    this.last = 0;
    if (running) this.schedule();
  }

  start() {
    this.running = true;
    this.last = performance.now();
    this.schedule();
  }

  schedule() {
    this.request = requestAnimationFrame(this.callback);
  }

  stop() {
    if (typeof this.request === "number") cancelAnimationFrame(this.request);
  }

  callback = (time: DOMHighResTimeStamp) => {
    const difference = Math.min(time - this.last, this.maxStep);
    this.tick(difference);
    this.last = time;

    if (this.running) this.schedule();
  };
}
