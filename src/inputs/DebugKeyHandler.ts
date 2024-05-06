import { getAStarPath } from "../pathfinding/astar";
import makeTilePath from "../tools/makeTilePath";
import setFont from "../tools/setFont";
import { invalidXY } from "../tools/xy";
import Game from "../types/Game";

export default class DebugKeyHandler {
  constructor(private g: Game) {
    window.addEventListener("keypress", (e) => {
      if (e.key === "c") g.renderFlags.cameraDebug = !g.renderFlags.cameraDebug;
      if (e.key === "f") g.renderFlags.showFPS = !g.renderFlags.showFPS;
      if (e.key === "o")
        g.renderFlags.imageOutline = !g.renderFlags.imageOutline;
      if (e.key === "p") g.renderFlags.pathDebug = !g.renderFlags.pathDebug;
    });

    g.addEventListener("Render", ({ detail: { ctx, flags } }) => {
      ctx.globalAlpha = 1;
      setFont(ctx, "16px sans-serif", "white", "left", "bottom");
      ctx.fillText("[C]amera, [F]PS, [O]utline, [P]ath", 8, g.size.height - 8);

      if (flags.pathDebug) {
        const { positionRounded: position } = g.player;
        if (!invalidXY(this.g.mouse.position)) {
          const { path, costSoFar } = getAStarPath(
            g.enemies,
            position,
            g.mouse.position,
          );

          ctx.globalAlpha = 0.1;
          ctx.fillStyle = "white";
          for (const t of path) {
            const x = makeTilePath(g.camera, t);
            ctx.fill(x);
          }

          ctx.globalAlpha = 0.3;
          setFont(ctx, "8px sans-serif", "white", "center", "middle");
          for (const [pos, amount] of costSoFar) {
            const screen = g.camera.worldToScreen(pos);
            ctx.fillText(amount.toFixed(1), screen.x, screen.y);
          }
        }
      }
    });
  }
}
