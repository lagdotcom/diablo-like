import { RenderEvent } from "../events";
import makeTilePath from "../tools/makeTilePath";
import setFont from "../tools/setFont";
import { Listener } from "../types/Dispatcher";
import Game from "../types/Game";

export default class DebugKeyHandler {
  constructor(private g: Game) {
    window.addEventListener("keypress", this.onKeyPress, { passive: true });
    g.addEventListener("Render", this.onRender, { passive: true });
  }

  onKeyPress = ({ key }: KeyboardEvent) => {
    const { g } = this;

    if (key === "c") g.renderFlags.cameraDebug = !g.renderFlags.cameraDebug;
    if (key === "f") g.renderFlags.showFPS = !g.renderFlags.showFPS;
    if (key === "o") g.renderFlags.imageOutline = !g.renderFlags.imageOutline;
    if (key === "p") g.renderFlags.pathDebug = !g.renderFlags.pathDebug;
  };

  onRender: Listener<RenderEvent> = ({ detail: { ctx, flags } }) => {
    const { g } = this;

    ctx.globalAlpha = 1;
    setFont(ctx, "16px sans-serif", "white", "left", "bottom");
    ctx.fillText("[C]amera, [F]PS, [O]utline, [P]ath", 8, g.size.height - 8);

    if (flags.pathDebug) {
      const path = g.path.getPlayerPath(g.mouse.position);
      if (!path) return;

      ctx.globalAlpha = 0.1;
      ctx.fillStyle = "white";
      for (const t of path.tiles) {
        const x = makeTilePath(g.camera, t);
        ctx.fill(x);
      }

      ctx.globalAlpha = 0.3;
      setFont(ctx, "8px sans-serif", "white", "center", "middle");
      for (const [pos, amount] of path.costSoFar) {
        const screen = g.camera.worldToScreen(pos);
        ctx.fillText(amount.toFixed(1), screen.x, screen.y);
      }
    }
  };
}
