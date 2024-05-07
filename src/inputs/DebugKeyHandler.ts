import CanvasResizer from "../components/CanvasResizer";
import DebugManager, { DebugFlag } from "../components/DebugManager";
import PathManager from "../components/PathManager";
import { RenderEvent } from "../events";
import makeTilePath from "../tools/makeTilePath";
import setFont from "../tools/setFont";
import { Listener } from "../types/Dispatcher";
import GameEvents from "../types/GameEvents";
import Camera from "../visuals/Camera";
import MouseHandler from "./MouseHandler";

const DebugFlagKeys: Record<string, DebugFlag> = {
  c: "camera",
  f: "fps",
  m: "mouse",
  o: "outline",
  p: "path",
};

export default class DebugKeyHandler {
  constructor(
    e: GameEvents,
    private camera: Camera,
    private debug: DebugManager,
    private mouse: MouseHandler,
    private path: PathManager,
    private size: CanvasResizer,
  ) {
    window.addEventListener("keypress", this.onKeyPress, { passive: true });
    e.addEventListener("Render", this.onRender, { passive: true });
  }

  onKeyPress = ({ key }: KeyboardEvent) => {
    const { debug } = this;

    const flag = DebugFlagKeys[key];
    if (flag) debug.toggle(flag);
  };

  onRender: Listener<RenderEvent> = ({ detail: { ctx, flags } }) => {
    const { camera, mouse, path, size } = this;

    ctx.globalAlpha = 1;
    setFont(ctx, "16px sans-serif", "white", "left", "bottom");
    ctx.fillText(
      "[C]amera, [F]PS, [M]ouse, [O]utline, [P]ath",
      8,
      size.height - 8,
    );

    if (flags.path) {
      const result = path.getPlayerPath(mouse.position);
      if (!result) return;

      ctx.globalAlpha = 0.1;
      ctx.fillStyle = "white";
      for (const t of result.tiles) {
        const x = makeTilePath(camera, t);
        ctx.fill(x);
      }

      ctx.globalAlpha = 0.3;
      setFont(ctx, "8px sans-serif", "white", "center", "middle");
      for (const [pos, amount] of result.costSoFar) {
        const screen = camera.worldToScreen(pos);
        ctx.fillText(amount.toFixed(1), screen.x, screen.y);
      }
    }
  };
}
