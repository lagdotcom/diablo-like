import Camera from "../components/Camera";
import FPSCounter from "../components/FPSCounter";
import GameClock from "../components/GameClock";
import MouseHandler from "../components/MouseHandler";
import Player from "../components/Player";
import {
  CanvasResizeEvent,
  LeftMouseEvent,
  RenderEvent,
  TickEvent,
} from "../events";
import { Pixels } from "../flavours";
import Dispatcher from "./Dispatcher";
import Drawable from "./Drawable";

export default interface Game
  extends Dispatcher<{
    LeftMouse: LeftMouseEvent;
    Render: RenderEvent;
    Tick: TickEvent;
  }> {
  canvas: HTMLCanvasElement;
  fpsCounter: FPSCounter;
  camera: Camera;
  clock: GameClock;
  mouse: MouseHandler;
  player: Player;
  size: Dispatcher<{ CanvasResize: CanvasResizeEvent }> & {
    width: Pixels;
    height: Pixels;
  };
  render: Drawable[];
}
