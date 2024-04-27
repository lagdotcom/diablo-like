import {
  JoypadButtonEvent,
  JoypadMoveEvent,
  ProcessInputEvent,
} from "../events";
import { Listener } from "../types/Dispatcher";
import Game from "../types/Game";

export default class JoypadHandler {
  gamepad: number;

  constructor(
    private g: Game,
    public axisThreshold = 0.1,
  ) {
    this.gamepad = NaN;
    window.addEventListener("gamepadconnected", this.onConnect);
  }

  private connect(index: number) {
    this.gamepad = index;

    this.g.addEventListener("ProcessInput", this.onProcessInput);
  }

  private disconnect() {
    this.gamepad = NaN;

    this.g.removeEventListener("ProcessInput", this.onProcessInput);
  }

  onConnect = (e: GamepadEvent) => {
    this.connect(e.gamepad.index);
  };

  onProcessInput: Listener<ProcessInputEvent> = () => {
    const pad = navigator.getGamepads()[this.gamepad];
    if (!pad || !pad.connected) {
      return this.disconnect();
    }

    const [x, y] = pad.axes;
    const distance = x ** 2 + y ** 2;
    if (distance > this.axisThreshold) {
      const angle = Math.atan2(y, x);
      this.g.dispatchEvent(new JoypadMoveEvent(angle));
    }

    for (let i = 0; i < pad.buttons.length; i++) {
      if (pad.buttons[i].pressed)
        this.g.dispatchEvent(new JoypadButtonEvent(i));
    }
  };
}
