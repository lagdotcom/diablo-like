import setFont from "../tools/setFont";
import Game from "../types/Game";

export default class DebugKeyHandler {
  constructor(private g: Game) {
    window.addEventListener("keypress", (e) => {
      if (e.key === "c") g.renderFlags.cameraDebug = !g.renderFlags.cameraDebug;
      if (e.key === "f") g.renderFlags.showFPS = !g.renderFlags.showFPS;
      if (e.key === "o")
        g.renderFlags.imageOutline = !g.renderFlags.imageOutline;
    });

    g.addEventListener("Render", ({ detail: { ctx } }) => {
      ctx.globalAlpha = 1;
      setFont(ctx, "16px sans-serif", "white", "left", "bottom");
      ctx.fillText("[C]amera, [F]PS, [O]utline", 8, g.size.height - 8);
    });
  }
}
