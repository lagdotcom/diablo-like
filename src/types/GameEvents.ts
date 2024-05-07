import {
  AnimationTriggerEvent,
  JoypadButtonEvent,
  JoypadMoveEvent,
  LeftMouseEvent,
  LoadingEvent,
  ProcessInputEvent,
  RenderEvent,
  RightMouseEvent,
  TickEvent,
} from "../events";
import Dispatcher from "./Dispatcher";

type GameEvents = Dispatcher<{
  AnimationTrigger: AnimationTriggerEvent;
  LeftMouse: LeftMouseEvent;
  Loading: LoadingEvent;
  JoypadButton: JoypadButtonEvent;
  JoypadMove: JoypadMoveEvent;
  ProcessInput: ProcessInputEvent;
  Render: RenderEvent;
  RightMouse: RightMouseEvent;
  Tick: TickEvent;
}>;
export default GameEvents;
