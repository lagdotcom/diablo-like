import Camera from "./components/Camera";
import CanvasResizer from "./components/CanvasResizer";
import FPSCounter from "./components/FPSCounter";
import GameClock, { TickFunction } from "./components/GameClock";
import MouseHandler from "./components/MouseHandler";
import Player from "./components/Player";
import { RenderEvent, TickEvent } from "./events";
import Drawable from "./types/Drawable";
import Game from "./types/Game";

export default class Engine extends EventTarget implements Game {
  fpsCounter: FPSCounter;
  camera: Camera;
  clock: GameClock;
  mouse: MouseHandler;
  player: Player;
  size: CanvasResizer;
  render: Drawable[];

  constructor(
    public canvas: HTMLCanvasElement,
    public ctx: CanvasRenderingContext2D,
  ) {
    super();
    this.render = [];
    this.size = new CanvasResizer(canvas);

    this.fpsCounter = new FPSCounter(this);
    this.player = new Player(this);
    this.camera = new Camera(this);
    this.mouse = new MouseHandler(this);

    this.clock = new GameClock(this.tick, 50);
  }

  tick: TickFunction = (step) => {
    this.dispatchEvent(new TickEvent(step));

    this.ctx.clearRect(0, 0, this.size.width, this.size.height);
    this.dispatchEvent(new RenderEvent(this.ctx));
  };
}
