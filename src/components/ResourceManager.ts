import { LoadingEvent } from "../events";
import { ResourceURL } from "../flavours";
import GameEvents from "../types/GameEvents";

export default class ResourceManager {
  private promises: Map<ResourceURL, Promise<unknown>>;
  private loaders: Promise<unknown>[];
  private loaded: number;
  private loading: number;

  constructor(private e: GameEvents) {
    this.promises = new Map();
    this.loaders = [];
    this.loaded = 0;
    this.loading = 0;
  }

  get loadingText() {
    if (this.loaded < this.loading)
      return `Loading: ${this.loaded} / ${this.loading}`;
  }

  private report() {
    this.e.dispatchEvent(new LoadingEvent(this.loaded, this.loading));
  }

  private start<T>(src: ResourceURL, promise: Promise<T>) {
    this.loading++;
    this.report();

    this.promises.set(src, promise);
    this.loaders.push(
      promise.then((arg) => {
        this.loaded++;
        this.report();
        return arg;
      }),
    );
    return promise;
  }

  loadImage(src: ResourceURL) {
    const res = this.promises.get(src);
    if (res) return res as Promise<HTMLImageElement>;

    return this.start(
      src,
      new Promise<HTMLImageElement>((resolve) => {
        const img = new Image();
        img.src = src;
        img.addEventListener("load", () => resolve(img));
      }),
    );
  }
}
