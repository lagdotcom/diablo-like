import CanvasResizer from "./components/CanvasResizer";
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
import Game from "./types/Game";
import RenderFlags from "./types/RenderFlags";
import IsometricCamera from "./visuals/Camera";
import FPSCounter from "./visuals/FPSCounter";
import MapGrid from "./visuals/MapGrid";

export default class Engine extends EventTarget implements Game {
  fpsCounter: FPSCounter;
  camera: IsometricCamera;
  clock: GameClock;
  enemies: Set<EntityBase<unknown>>;
  fuse: FuseManager;
  joypad: JoypadHandler;
  mapGrid: MapGrid;
  mouse: MouseHandler;
  path: PathManager;
  player: Player;
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
    this.renderFlags = {
      cameraDebug: false,
      imageOutline: false,
      pathDebug: true,
      showFPS: true,
    };
    this.res = new ResourceManager(this);
    this.size = new CanvasResizer(canvas);
    this.path = new PathManager(this);

    this.fpsCounter = new FPSCounter(this);
    this.fuse = new FuseManager(this);
    this.player = new Player(this, xy(0, 0));
    this.mapGrid = new MapGrid(this);
    this.camera = new IsometricCamera(this);
    this.mouse = new MouseHandler(this);
    this.joypad = new JoypadHandler(this);

    this.enemies = new Set([
      new Fallen(this, xy(10, 0)),
      new Fallen(this, xy(0, -10)),
    ]);

    new DebugKeyHandler(this);

    this.clock = new GameClock(this.tick, 50);
  }

  tick: TickFunction = (step) => {
    const { ctx, res, size } = this;

    ctx.save();
    ctx.clearRect(0, 0, size.width, size.height);

    const loadingText = res.loadingText;
    if (loadingText) {
      setFont(ctx, "64px sans-serif", "white", "center", "middle");
      ctx.fillText(loadingText, size.width / 2, size.height / 2);
      return;
    }

    this.dispatchEvent(new ProcessInputEvent());
    this.dispatchEvent(new TickEvent(step));
    this.dispatchEvent(new RenderEvent(ctx, this.renderFlags));

    ctx.restore();
  };
}
