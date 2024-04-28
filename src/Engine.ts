import Camera from "./components/Camera";
import CanvasResizer from "./components/CanvasResizer";
import FPSCounter from "./components/FPSCounter";
import FuseManager from "./components/FuseManager";
import GameClock, { TickFunction } from "./components/GameClock";
import JoypadHandler from "./components/JoypadHandler";
import MouseHandler from "./components/MouseHandler";
import Player from "./components/Player";
import ResourceManager from "./components/ResourceManager";
import { ProcessInputEvent, RenderEvent, TickEvent } from "./events";
import Drawable from "./types/Drawable";
import Game from "./types/Game";

export default class Engine extends EventTarget implements Game {
  fpsCounter: FPSCounter;
  camera: Camera;
  clock: GameClock;
  fuse: FuseManager;
  joypad: JoypadHandler;
  mouse: MouseHandler;
  player: Player;
  res: ResourceManager;
  size: CanvasResizer;
  render: Set<Drawable>;

  constructor(
    public canvas: HTMLCanvasElement,
    public ctx: CanvasRenderingContext2D,
  ) {
    super();
    this.render = new Set();
    this.res = new ResourceManager(this);
    this.size = new CanvasResizer(canvas);

    this.fpsCounter = new FPSCounter(this);
    this.fuse = new FuseManager(this);
    this.player = new Player(this);
    this.camera = new Camera(this);
    this.mouse = new MouseHandler(this);
    this.joypad = new JoypadHandler(this);

    this.clock = new GameClock(this.tick, 50);
  }

  tick: TickFunction = (step) => {
    this.ctx.clearRect(0, 0, this.size.width, this.size.height);

    const loadingText = this.res.loadingText;
    if (loadingText) {
      this.ctx.font = "64px sans-serif";
      this.ctx.fillStyle = "white";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText(loadingText, this.size.width / 2, this.size.height / 2);
      return;
    }

    this.dispatchEvent(new ProcessInputEvent());

    this.dispatchEvent(new TickEvent(step));

    this.dispatchEvent(new RenderEvent(this.ctx));
  };
}
