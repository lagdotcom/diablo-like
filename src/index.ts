import Engine from "./Engine";
import makeCanvas from "./tools/makeCanvas";

function init() {
  const { canvas, context } = makeCanvas("2d");
  document.body.appendChild(canvas);

  window.g = new Engine(canvas, context);
}

window.addEventListener("load", init, { passive: true });
