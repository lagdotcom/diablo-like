import { CanvasResizeEvent } from "../events";
import { Pixels } from "../flavours";
import { xy } from "../tools/xy";
import Dispatcher from "../types/Dispatcher";

export default class CanvasResizer
  extends EventTarget
  implements Dispatcher<{ CanvasResize: CanvasResizeEvent }>
{
  constructor(private canvas: HTMLCanvasElement) {
    super();

    window.addEventListener("resize", this.resize, { passive: true });
    this.resize();
  }

  get xy() {
    return xy(this.width, this.height);
  }

  get width(): Pixels {
    return this.canvas.width;
  }
  get height(): Pixels {
    return this.canvas.height;
  }

  detach() {
    window.removeEventListener("resize", this.resize);
  }

  resize = () => {
    const { innerWidth: width, innerHeight: height } = window;
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.dispatchEvent(new CanvasResizeEvent(width, height));
  };
}
