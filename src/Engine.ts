import CanvasResizer from "./components/CanvasResizer";
import DebugManager from "./components/DebugManager";
import FuseManager from "./components/FuseManager";
import GameClock, { TickFunction } from "./components/GameClock";
import PathManager from "./components/PathManager";
import ResourceManager from "./components/ResourceManager";
import EntityBase from "./entities/EntityBase";
import Fallen from "./entities/Fallen";
import Player from "./entities/Player";
import { ProcessInputEvent, RenderEvent, TickEvent } from "./events";
import DebugKeyHandler from "./inputs/DebugKeyHandler";
import JoypadHandler from "./inputs/JoypadHandler";
import MouseHandler from "./inputs/MouseHandler";
import setFont from "./tools/setFont";
import { xy } from "./tools/xy";
import Drawable from "./types/Drawable";
import GameEvents from "./types/GameEvents";
import Camera from "./visuals/Camera";
import FPSCounter from "./visuals/FPSCounter";
import MapGrid from "./visuals/MapGrid";

export default class Engine {
  e: GameEvents;
  camera: Camera;
  clock: GameClock;
  debug: DebugManager;
  enemies: Set<EntityBase>;
  fpsCounter: FPSCounter;
  fuse: FuseManager;
  joypad: JoypadHandler;
  mapGrid: MapGrid;
  mouse: MouseHandler;
  path: PathManager;
  player: Player;
  render: Set<Drawable>;
  res: ResourceManager;
  size: CanvasResizer;

  constructor(
    public canvas: HTMLCanvasElement,
    public ctx: CanvasRenderingContext2D,
  ) {
    this.e = new EventTarget();
    this.render = new Set();
    this.res = new ResourceManager(this.e);
    this.size = new CanvasResizer(canvas);

    this.debug = new DebugManager(this.e, this.size, {
      camera: false,
      mouse: false,
      outline: false,
      path: true,
      fps: true,
    });
    this.fpsCounter = new FPSCounter(this.e, this.size);
    this.fuse = new FuseManager(this.e);
    this.player = new Player(
      this.e,
      this.fuse,
      this.render,
      this.res,
      xy(0, 0),
    );
    this.camera = new Camera(
      this.e,
      this.debug,
      this.player,
      this.render,
      this.size,
    );
    this.mouse = new MouseHandler(this.e, this.camera, this.canvas, this.debug);
    this.mapGrid = new MapGrid(this.e, this.camera, this.mouse, this.size);
    this.joypad = new JoypadHandler(this.e);

    this.enemies = new Set([
      new Fallen(this.e, this.player, this.render, this.res, xy(10, 0)),
      new Fallen(this.e, this.player, this.render, this.res, xy(0, -10)),
    ]);

    this.path = new PathManager(this.player, this.enemies);

    new DebugKeyHandler(
      this.e,
      this.camera,
      this.debug,
      this.mouse,
      this.path,
      this.size,
    );

    this.clock = new GameClock(this.tick, 50);
  }

  private tick: TickFunction = (step) => {
    const { e, debug, ctx, res, size } = this;

    ctx.save();
    ctx.clearRect(0, 0, size.width, size.height);

    const loadingText = res.loadingText;
    if (loadingText) {
      setFont(ctx, "64px sans-serif", "white", "center", "middle");
      ctx.fillText(loadingText, size.width / 2, size.height / 2);
      return;
    }

    debug.reset();
    e.dispatchEvent(new ProcessInputEvent());
    e.dispatchEvent(new TickEvent(step));
    e.dispatchEvent(new RenderEvent(ctx, debug.flags));

    ctx.restore();
  };
}
