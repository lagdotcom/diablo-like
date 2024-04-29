import setFont from "../tools/setFont";
import Game from "../types/Game";

export default class DebugKeyHandler {
  constructor(private g: Game) {
    window.addEventListener("keypress", (e) => {
      if (e.key === "h") g.renderFlags.hitBox = !g.renderFlags.hitBox;
      if (e.key === "a") g.renderFlags.attackBox = !g.renderFlags.attackBox;
    });

    g.addEventListener("Render", ({ detail: { ctx } }) => {
      setFont(ctx, "24px sans-serif", "white", "left", "bottom");
      ctx.fillText("[H]it box / [A]ttack box", 8, g.size.height - 8);
    });
  }
}
