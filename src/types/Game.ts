import Camera from "../components/Camera";
import FPSCounter from "../components/FPSCounter";
import FuseManager from "../components/FuseManager";
import GameClock from "../components/GameClock";
import JoypadHandler from "../components/JoypadHandler";
import MouseHandler from "../components/MouseHandler";
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
import Dispatcher from "./Dispatcher";
import Drawable from "./Drawable";
import Projection from "./Projection";
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
  camera: Camera;
  canvas: HTMLCanvasElement;
  clock: GameClock;
  enemies: Set<EntityBase<unknown>>;
  fpsCounter: FPSCounter;
  fuse: FuseManager;
  joypad: JoypadHandler;
  mouse: MouseHandler;
  player: Player;
  projection: Projection;
  render: Set<Drawable>;
  renderFlags: RenderFlags;
  res: ResourceManager;
  size: Dispatcher<{ CanvasResize: CanvasResizeEvent }> & {
    width: Pixels;
    height: Pixels;
    xy: XY<Pixels>;
  };
}
