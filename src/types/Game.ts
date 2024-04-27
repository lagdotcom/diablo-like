import Camera from "../components/Camera";
import FPSCounter from "../components/FPSCounter";
import FuseManager from "../components/FuseManager";
import GameClock from "../components/GameClock";
import MouseHandler from "../components/MouseHandler";
import Player from "../components/Player";
import {
  CanvasResizeEvent,
  LeftMouseEvent,
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
    Render: RenderEvent;
    RightMouse: RightMouseEvent;
    Tick: TickEvent;
  }> {
  canvas: HTMLCanvasElement;
  fuse: FuseManager;
  fpsCounter: FPSCounter;
  camera: Camera;
  clock: GameClock;
  mouse: MouseHandler;
  player: Player;
  size: Dispatcher<{ CanvasResize: CanvasResizeEvent }> & {
    width: Pixels;
    height: Pixels;
    xy: XY<Pixels>;
  };
  render: Set<Drawable>;
}
