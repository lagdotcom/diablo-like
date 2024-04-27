type CanvasContextID = "2d" | "bitmaprenderer" | "webgl" | "webgl2";

interface CanvasContextSettings {
  "2d": CanvasRenderingContext2DSettings;
  bitmaprenderer: ImageBitmapRenderingContextSettings;
  webgl: WebGLContextAttributes;
  webgl2: WebGLContextAttributes;
}

interface CanvasContext {
  "2d": CanvasRenderingContext2D;
  bitmaprenderer: ImageBitmapRenderingContext;
  webgl: WebGLRenderingContext;
  webgl2: WebGL2RenderingContext;
}

export default function makeCanvas<T extends CanvasContextID>(
  contextId: T,
  settings?: CanvasContextSettings[T],
): { canvas: HTMLCanvasElement; context: CanvasContext[T] } {
  const canvas = document.createElement("canvas");

  const context = canvas.getContext(contextId, settings) as
    | CanvasContext[T]
    | null;
  if (!context) throw new Error(`Could not get ${contextId} canvas context`);

  return { canvas, context };
}
