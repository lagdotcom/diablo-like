import { CanvasResizeEvent } from "../events";
import { Pixels } from "../flavours";
import { xy } from "../tools/xy";
import Dispatcher from "../types/Dispatcher";
import XY from "../types/XY";

type CanvasEvents = Dispatcher<{ CanvasResize: CanvasResizeEvent }>;

export default class CanvasResizer implements CanvasEvents {
  e: EventTarget;
  xy!: XY<Pixels>;
  width!: number;
  height!: number;

  addEventListener: CanvasEvents["addEventListener"];
  dispatchEvent: CanvasEvents["dispatchEvent"];
  removeEventListener: CanvasEvents["removeEventListener"];

  constructor(private canvas: HTMLCanvasElement) {
    this.e = new EventTarget();
    this.addEventListener = this.e.addEventListener.bind(this.e);
    this.dispatchEvent = this.e.dispatchEvent.bind(this.e);
    this.removeEventListener = this.e.removeEventListener.bind(this.e);

    window.addEventListener("resize", this.resize, { passive: true });
    this.resize();
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

    this.width = width;
    this.height = height;
    this.xy = xy(width, height);

    this.e.dispatchEvent(new CanvasResizeEvent(width, height));
  };
}
