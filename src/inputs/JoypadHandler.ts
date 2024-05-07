import {
  JoypadButtonEvent,
  JoypadMoveEvent,
  ProcessInputEvent,
} from "../events";
import { GamepadID } from "../flavours";
import { Listener } from "../types/Dispatcher";
import GameEvents from "../types/GameEvents";

export default class JoypadHandler {
  gamepad: GamepadID;

  constructor(
    private e: GameEvents,
    public axisThreshold = 0.1,
  ) {
    this.gamepad = NaN;
    window.addEventListener("gamepadconnected", this.onConnect, {
      passive: true,
    });
  }

  private connect(index: GamepadID) {
    this.gamepad = index;

    this.e.addEventListener("ProcessInput", this.onProcessInput, {
      passive: true,
    });
  }

  private disconnect() {
    this.gamepad = NaN;

    this.e.removeEventListener("ProcessInput", this.onProcessInput);
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
    const distanceSquared = x ** 2 + y ** 2;
    if (distanceSquared > this.axisThreshold) {
      const angle = Math.atan2(y, x);
      this.e.dispatchEvent(new JoypadMoveEvent(angle));
    }

    for (let i = 0; i < pad.buttons.length; i++) {
      if (pad.buttons[i].pressed)
        this.e.dispatchEvent(new JoypadButtonEvent(i));
    }
  };
}
