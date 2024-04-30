import Camera from "./components/Camera";
import CanvasResizer from "./components/CanvasResizer";
import DebugKeyHandler from "./components/DebugKeyHandler";
import FlatProjection from "./components/FlatProjection";
import FPSCounter from "./components/FPSCounter";
import FuseManager from "./components/FuseManager";
import GameClock, { TickFunction } from "./components/GameClock";
import JoypadHandler from "./components/JoypadHandler";
import MapGrid from "./components/MapGrid";
import MouseHandler from "./components/MouseHandler";
import ResourceManager from "./components/ResourceManager";
import EntityBase from "./entities/EntityBase";
import Fallen from "./entities/Fallen";
import Player from "./entities/Player";
import { ProcessInputEvent, RenderEvent, TickEvent } from "./events";
import setFont from "./tools/setFont";
import { xy } from "./tools/xy";
import Drawable from "./types/Drawable";
import Game from "./types/Game";
import Projection from "./types/Projection";
import RenderFlags from "./types/RenderFlags";

export default class Engine extends EventTarget implements Game {
  fpsCounter: FPSCounter;
  camera: Camera;
  clock: GameClock;
  enemies: Set<EntityBase<unknown>>;
  fuse: FuseManager;
  joypad: JoypadHandler;
  mouse: MouseHandler;
  player: Player;
  projection: Projection;
  res: ResourceManager;
  size: CanvasResizer;
  render: Set<Drawable>;
  renderFlags: RenderFlags;

  constructor(
    public canvas: HTMLCanvasElement,
    public ctx: CanvasRenderingContext2D,
  ) {
    super();
    this.render = new Set();
    this.renderFlags = { hitBox: false, attackBox: false };
    this.res = new ResourceManager(this);
    this.size = new CanvasResizer(canvas);
    this.projection = new FlatProjection();

    this.fpsCounter = new FPSCounter(this);
    this.fuse = new FuseManager(this);
    this.player = new Player(this, xy(0, 0));
    new MapGrid(this);
    this.camera = new Camera(this);
    this.mouse = new MouseHandler(this);
    this.joypad = new JoypadHandler(this);

    this.enemies = new Set([
      new Fallen(this, xy(200, 0)),
      new Fallen(this, xy(-10, 120)),
    ]);

    new DebugKeyHandler(this);

    this.clock = new GameClock(this.tick, 50);
  }

  tick: TickFunction = (step) => {
    this.ctx.clearRect(0, 0, this.size.width, this.size.height);

    const loadingText = this.res.loadingText;
    if (loadingText) {
      setFont(this.ctx, "64px sans-serif", "white", "center", "middle");
      this.ctx.fillText(loadingText, this.size.width / 2, this.size.height / 2);
      return;
    }

    this.dispatchEvent(new ProcessInputEvent());

    this.dispatchEvent(new TickEvent(step));

    this.dispatchEvent(new RenderEvent(this.ctx, this.renderFlags));
  };
}
