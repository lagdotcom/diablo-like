import DebugManager from "../components/DebugManager";
import { LeftMouseEvent, ProcessInputEvent, RightMouseEvent } from "../events";
import { Pixels } from "../flavours";
import { printXY, xy } from "../tools/xy";
import { Listener } from "../types/Dispatcher";
import GameEvents from "../types/GameEvents";
import XY from "../types/XY";
import Camera from "../visuals/Camera";

export default class MouseHandler {
  left: boolean;
  right: boolean;
  screen: XY<Pixels>;

  constructor(
    private e: GameEvents,
    private camera: Camera,
    container: HTMLElement,
    private debug: DebugManager,
  ) {
    this.left = false;
    this.right = false;
    this.screen = xy(NaN, NaN);

    container.addEventListener("pointerdown", this.onUpdate, { passive: true });
    container.addEventListener("pointerup", this.onUpdate, { passive: true });
    container.addEventListener("pointermove", this.onUpdate, { passive: true });
    container.addEventListener("pointerout", this.onReset, { passive: true });
    container.addEventListener("contextmenu", (e) => e.preventDefault());
    e.addEventListener("ProcessInput", this.onProcessInput, { passive: true });
  }

  get position() {
    return this.camera.screenToWorld(this.screen);
  }

  onUpdate = (e: PointerEvent) => {
    this.left = !!(e.buttons & 1);
    this.right = !!(e.buttons & 2);
    this.screen = xy(e.x, e.y);
  };

  onReset = () => {
    this.left = false;
    this.right = false;
    this.screen = xy(NaN, NaN);
  };

  onProcessInput: Listener<ProcessInputEvent> = () => {
    const { e, position, left, right, debug } = this;

    if (left) e.dispatchEvent(new LeftMouseEvent(position));
    if (right) e.dispatchEvent(new RightMouseEvent(position));

    if (debug.flags.mouse) debug.add(`mouse: ${printXY(position)}`);
  };
}
