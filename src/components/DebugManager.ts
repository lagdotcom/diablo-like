import { RenderEvent } from "../events";
import setFont from "../tools/setFont";
import DebugFlags from "../types/DebugFlags";
import { Listener } from "../types/Dispatcher";
import GameEvents from "../types/GameEvents";
import CanvasResizer from "./CanvasResizer";

export type DebugFlag = keyof DebugFlags;

export default class DebugManager {
  private lines: string[];

  constructor(
    e: GameEvents,
    private size: CanvasResizer,
    public flags: DebugFlags,
  ) {
    this.lines = [];

    e.addEventListener("Render", this.onRender, { passive: true });
  }

  toggle(key: DebugFlag) {
    this.flags[key] = !this.flags[key];
  }

  add(line: string) {
    this.lines.push(line);
  }

  reset() {
    this.lines = [];
  }

  onRender: Listener<RenderEvent> = ({ detail: { ctx } }) => {
    const x = this.size.width - 120;
    let y = 100;

    setFont(ctx, "12px sans-serif", "white", "left", "top");
    for (const line of this.lines) ctx.fillText(line, x, (y += 20));
  };
}
