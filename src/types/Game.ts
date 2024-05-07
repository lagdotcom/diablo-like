import FuseManager from "../components/FuseManager";
import GameClock from "../components/GameClock";
import PathManager from "../components/PathManager";
import ResourceManager from "../components/ResourceManager";
import EntityBase from "../entities/EntityBase";
import Player from "../entities/Player";
import {
  AnimationTriggerEvent,
  CanvasResizeEvent,
  JoypadButtonEvent,
  JoypadMoveEvent,
  LeftMouseEvent,
  LoadingEvent,
  ProcessInputEvent,
  RenderEvent,
  RightMouseEvent,
  TickEvent,
} from "../events";
import { Pixels } from "../flavours";
import JoypadHandler from "../inputs/JoypadHandler";
import MouseHandler from "../inputs/MouseHandler";
import IsometricCamera from "../visuals/Camera";
import FPSCounter from "../visuals/FPSCounter";
import MapGrid from "../visuals/MapGrid";
import Dispatcher from "./Dispatcher";
import Drawable from "./Drawable";
import RenderFlags from "./RenderFlags";
import XY from "./XY";

export default interface Game
  extends Dispatcher<{
    AnimationTrigger: AnimationTriggerEvent;
    LeftMouse: LeftMouseEvent;
    Loading: LoadingEvent;
    JoypadButton: JoypadButtonEvent;
    JoypadMove: JoypadMoveEvent;
    ProcessInput: ProcessInputEvent;
    Render: RenderEvent;
    RightMouse: RightMouseEvent;
    Tick: TickEvent;
  }> {
  camera: IsometricCamera;
  canvas: HTMLCanvasElement;
  clock: GameClock;
  enemies: Set<EntityBase<unknown>>;
  fpsCounter: FPSCounter;
  fuse: FuseManager;
  joypad: JoypadHandler;
  mapGrid: MapGrid;
  mouse: MouseHandler;
  path: PathManager;
  player: Player;
  render: Set<Drawable>;
  renderFlags: RenderFlags;
  res: ResourceManager;
  size: Dispatcher<{ CanvasResize: CanvasResizeEvent }> & {
    width: Pixels;
    height: Pixels;
    xy: XY<Pixels>;
  };
}
