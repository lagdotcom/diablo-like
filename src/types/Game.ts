import Camera from "../components/Camera";
import FPSCounter from "../components/FPSCounter";
import FuseManager from "../components/FuseManager";
import GameClock from "../components/GameClock";
import JoypadHandler from "../components/JoypadHandler";
import MouseHandler from "../components/MouseHandler";
import Player from "../components/Player";
import {
  CanvasResizeEvent,
  JoypadButtonEvent,
  JoypadMoveEvent,
  LeftMouseEvent,
  ProcessInputEvent,
  RenderEvent,
  RightMouseEvent,
  TickEvent,
} from "../events";
import { Pixels } from "../flavours";
import Dispatcher from "./Dispatcher";
import Drawable from "./Drawable";
import XY from "./XY";

export default interface Game
  extends Dispatcher<{
    LeftMouse: LeftMouseEvent;
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
  fpsCounter: FPSCounter;
  fuse: FuseManager;
  joypad: JoypadHandler;
  mouse: MouseHandler;
  player: Player;
  render: Set<Drawable>;
  size: Dispatcher<{ CanvasResize: CanvasResizeEvent }> & {
    width: Pixels;
    height: Pixels;
    xy: XY<Pixels>;
  };
}
