"use strict";
(() => {
  // src/components/Camera.ts
  var Camera = class {
    constructor(g) {
      this.g = g;
      this.onResize = ({ detail: { width, height } }) => {
        this.width = width;
        this.height = height;
      };
      this.onTick = () => {
      };
      this.onRender = ({ detail: { ctx } }) => {
        const { left, top } = this;
        for (const r of this.g.render) {
          const ox = r.x - left;
          const oy = r.y - top;
          r.draw(ctx, ox, oy);
        }
      };
      this.width = g.size.width;
      this.height = g.size.height;
      this.x = g.player.x;
      this.y = g.player.y;
      g.size.addEventListener("CanvasResize", this.onResize, { passive: true });
      g.addEventListener("Tick", this.onTick, { passive: true });
      g.addEventListener("Render", this.onRender, { passive: true });
    }
    get left() {
      return this.x - this.width / 2;
    }
    get right() {
      return this.x + this.width / 2;
    }
    get top() {
      return this.y - this.height / 2;
    }
    get bottom() {
      return this.y + this.height / 2;
    }
  };

  // src/events.ts
  var CanvasResizeEvent = class extends CustomEvent {
    constructor(width, height) {
      super("CanvasResize", { detail: { width, height } });
    }
  };
  var LeftMouseEvent = class extends CustomEvent {
    constructor(x, y) {
      super("LeftMouse", { detail: { x, y } });
    }
  };
  var RenderEvent = class extends CustomEvent {
    constructor(ctx) {
      super("Render", { detail: { ctx } });
    }
  };
  var TickEvent = class extends CustomEvent {
    constructor(step) {
      super("Tick", { detail: { step } });
    }
  };

  // src/components/CanvasResizer.ts
  var CanvasResizer = class extends EventTarget {
    constructor(canvas) {
      super();
      this.canvas = canvas;
      this.resize = () => {
        const { innerWidth: width, innerHeight: height } = window;
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
        this.dispatchEvent(new CanvasResizeEvent(width, height));
      };
      window.addEventListener("resize", this.resize, { passive: true });
      this.resize();
    }
    get width() {
      return this.canvas.width;
    }
    get height() {
      return this.canvas.height;
    }
    detach() {
      window.removeEventListener("resize", this.resize);
    }
  };

  // src/components/FPSCounter.ts
  var FPSCounter = class {
    constructor(g, samples = 10) {
      this.samples = samples;
      this.onResize = ({ detail: { width, height } }) => {
        this.x = width - 8;
        this.y = height - 8;
      };
      this.onTick = ({ detail: { step } }) => {
        this.steps.push(step);
        if (this.steps.length > this.samples)
          this.steps.shift();
      };
      this.onRender = ({ detail: { ctx } }) => {
        ctx.fillStyle = "yellow";
        ctx.textAlign = "end";
        ctx.textBaseline = "bottom";
        ctx.font = "24px sans-serif";
        const { fps, x, y } = this;
        ctx.fillText(Math.round(fps).toString(), x, y);
      };
      this.steps = [];
      this.x = g.size.width - 8;
      this.y = g.size.height - 8;
      g.size.addEventListener("CanvasResize", this.onResize, { passive: true });
      g.addEventListener("Tick", this.onTick, { passive: true });
      g.addEventListener("Render", this.onRender, { passive: true });
    }
    get fps() {
      if (this.steps.length === 0)
        return 0;
      return 1e3 / (this.steps.reduce((p, c) => p + c, 0) / this.steps.length);
    }
  };

  // src/components/GameClock.ts
  var GameClock = class {
    constructor(tick, maxStep, running = true) {
      this.tick = tick;
      this.maxStep = maxStep;
      this.running = running;
      this.callback = (time) => {
        const difference = Math.min(time - this.last, this.maxStep);
        this.tick(difference);
        this.last = time;
        if (this.running)
          this.schedule();
      };
      this.last = 0;
      if (running)
        this.schedule();
    }
    start() {
      this.running = true;
      this.last = performance.now();
      this.schedule();
    }
    schedule() {
      this.request = requestAnimationFrame(this.callback);
    }
    stop() {
      if (typeof this.request === "number")
        cancelAnimationFrame(this.request);
    }
  };

  // src/components/MouseHandler.ts
  var MouseHandler = class {
    constructor(g) {
      this.g = g;
      this.onUpdate = (e) => {
        this.left = !!(e.buttons & 1);
        this.right = !!(e.buttons & 2);
        this.x = e.x;
        this.y = e.y;
      };
      this.onTick = () => {
        const { left, top } = this.g.camera;
        if (this.left)
          this.g.dispatchEvent(new LeftMouseEvent(this.x + left, this.y + top));
      };
      this.left = false;
      this.right = false;
      this.x = NaN;
      this.y = NaN;
      g.canvas.addEventListener("mousedown", this.onUpdate, { passive: true });
      g.canvas.addEventListener("mouseup", this.onUpdate, { passive: true });
      g.canvas.addEventListener("mousemove", this.onUpdate, { passive: true });
      g.addEventListener("Tick", this.onTick, { passive: true });
    }
  };

  // src/tools/drawCircle.ts
  function drawCircle(ctx, x, y, r, stroke, fill) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r / 2, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // src/components/Player.ts
  var Player = class {
    constructor(g, x = 0, y = 0, radius = 30, height = 70, heading = 0, speed = 1) {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.height = height;
      this.heading = heading;
      this.speed = speed;
      this.onLeft = ({ detail: { x, y } }) => {
        const distance = Math.sqrt((this.x - x) ** 2 + (this.y - y) ** 2);
        if (distance > this.radius)
          this.destination = { x, y };
      };
      this.onTick = ({ detail: { step } }) => {
        const { x, y, speed, destination } = this;
        if (destination) {
          const { x: ex, y: ey } = destination;
          const distance = Math.sqrt((ex - x) ** 2 + (ey - y) ** 2);
          const move = speed * step;
          const angle = Math.atan2(ey - y, ex - x);
          this.heading = angle;
          const sy = Math.sin(angle) * move;
          const sx = Math.cos(angle) * move;
          this.x += sx;
          this.y += sy;
          if (distance <= move)
            this.destination = void 0;
        }
      };
      g.render.push(this);
      g.addEventListener("LeftMouse", this.onLeft, { passive: true });
      g.addEventListener("Tick", this.onTick, { passive: true });
    }
    draw(ctx, ox, oy) {
      const { radius, height } = this;
      drawCircle(ctx, ox, oy, radius, "skyblue", "blue");
      drawCircle(ctx, ox, oy - height, radius, "skyblue", "blue");
      ctx.beginPath();
      ctx.moveTo(ox - radius, oy);
      ctx.lineTo(ox - radius, oy - height);
      ctx.moveTo(ox + radius, oy);
      ctx.lineTo(ox + radius, oy - height);
      ctx.stroke();
    }
  };

  // src/Engine.ts
  var Engine = class extends EventTarget {
    constructor(canvas, ctx) {
      super();
      this.canvas = canvas;
      this.ctx = ctx;
      this.tick = (step) => {
        this.dispatchEvent(new TickEvent(step));
        this.ctx.clearRect(0, 0, this.size.width, this.size.height);
        this.dispatchEvent(new RenderEvent(this.ctx));
      };
      this.render = [];
      this.size = new CanvasResizer(canvas);
      this.fpsCounter = new FPSCounter(this);
      this.player = new Player(this);
      this.camera = new Camera(this);
      this.mouse = new MouseHandler(this);
      this.clock = new GameClock(this.tick, 50);
    }
  };

  // src/tools/makeCanvas.ts
  function makeCanvas(contextId, settings) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext(contextId, settings);
    if (!context)
      throw new Error(`Could not get ${contextId} canvas context`);
    return { canvas, context };
  }

  // src/index.ts
  function init() {
    const { canvas, context } = makeCanvas("2d");
    document.body.appendChild(canvas);
    window.g = new Engine(canvas, context);
  }
  window.addEventListener("load", init, { passive: true });
})();
