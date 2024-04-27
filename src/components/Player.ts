import { LeftMouseEvent, TickEvent } from "../events";
import { Pixels, PixelsPerMillisecond, Radians } from "../flavours";
import drawCircle from "../tools/drawCircle";
import { Listener } from "../types/Dispatcher";
import Drawable from "../types/Drawable";
import Game from "../types/Game";

export default class Player implements Drawable {
  destination?: { x: number; y: number };

  constructor(
    g: Game,
    public x: Pixels = 0,
    public y: Pixels = 0,
    public radius: Pixels = 30,
    public height: Pixels = 70,
    public heading: Radians = 0,
    public speed: PixelsPerMillisecond = 1,
  ) {
    g.render.push(this);

    g.addEventListener("LeftMouse", this.onLeft, { passive: true });
    g.addEventListener("Tick", this.onTick, { passive: true });
  }

  onLeft: Listener<LeftMouseEvent> = ({ detail: { x, y } }) => {
    const distance = Math.sqrt((this.x - x) ** 2 + (this.y - y) ** 2);

    if (distance > this.radius) this.destination = { x, y };
  };

  onTick: Listener<TickEvent> = ({ detail: { step } }) => {
    const { x, y, speed, destination } = this;

    if (destination) {
      const { x: ex, y: ey } = destination;
      const distance = Math.sqrt((ex - x) ** 2 + (ey - y) ** 2);
      const move = speed * step;

      const angle: Radians = Math.atan2(ey - y, ex - x);
      this.heading = angle;

      const sy: Pixels = Math.sin(angle) * move;
      const sx: Pixels = Math.cos(angle) * move;

      this.x += sx;
      this.y += sy;

      if (distance <= move) this.destination = undefined;
    }
  };

  draw(ctx: CanvasRenderingContext2D, ox: Pixels, oy: Pixels) {
    const { radius, height } = this;

    drawCircle(ctx, ox, oy, radius, "skyblue", "blue");
    drawCircle(ctx, ox, oy - height, radius, "skyblue", "blue");

    ctx.beginPath();
    ctx.moveTo(ox - radius, oy);
    ctx.lineTo(ox - radius, oy - height);
    ctx.moveTo(ox + radius, oy);
    ctx.lineTo(ox + radius, oy - height);
    ctx.stroke();
  }
}
