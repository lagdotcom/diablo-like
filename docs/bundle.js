"use strict";
(() => {
  // src/tools/xy.ts
  var xy = (x, y) => ({ x, y });
  function addXY(a, b) {
    return xy(a.x + b.x, a.y + b.y);
  }
  function betweenXY(a, b) {
    return Math.atan2(a.y - b.y, a.x - b.x);
  }
  function subXY(a, b) {
    return xy(a.x - b.x, a.y - b.y);
  }
  function vectorXY(angle, length) {
    return xy(Math.cos(angle) * length, Math.sin(angle) * length);
  }

  // src/components/Camera.ts
  var Camera = class {
    constructor(g) {
      this.g = g;
      this.onResize = ({ detail: { width, height } }) => {
        this.size = xy(width, height);
      };
      this.onRender = ({ detail: { ctx } }) => {
        for (const r of this.g.render) {
          const offset = subXY(r.position, this.offset);
          r.draw(ctx, offset);
        }
      };
      this.size = g.size.xy;
      this.position = g.player.position;
      g.size.addEventListener("CanvasResize", this.onResize, { passive: true });
      g.addEventListener("Render", this.onRender, { passive: true });
    }
    get halfSize() {
      return xy(this.size.x / 2, this.size.y / 2);
    }
    get offset() {
      return subXY(this.position, this.halfSize);
    }
  };

  // src/events.ts
  var CanvasResizeEvent = class extends CustomEvent {
    constructor(width, height) {
      super("CanvasResize", { detail: { width, height } });
    }
  };
  var LeftMouseEvent = class extends CustomEvent {
    constructor(detail) {
      super("LeftMouse", { detail });
    }
  };
  var RenderEvent = class extends CustomEvent {
    constructor(ctx) {
      super("Render", { detail: { ctx } });
    }
  };
  var RightMouseEvent = class extends CustomEvent {
    constructor(detail) {
      super("RightMouse", { detail });
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
    get xy() {
      return xy(this.width, this.height);
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

  // src/components/FuseManager.ts
  var FuseManager = class {
    constructor(g) {
      this.onTick = ({ detail: { step } }) => {
        for (const fuse of this.fuses) {
          fuse.left -= step;
          if (fuse.left <= 0) {
            fuse.active = false;
            fuse.callback();
            this.fuses.delete(fuse);
          }
        }
      };
      this.fuses = /* @__PURE__ */ new Set();
      g.addEventListener("Tick", this.onTick);
    }
    add(time, callback) {
      const fuse = { left: time, callback, active: true };
      this.fuses.add(fuse);
      return fuse;
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
        this.position = xy(e.x, e.y);
        if (this.right)
          e.preventDefault();
      };
      this.onReset = () => {
        this.left = false;
        this.right = false;
      };
      this.onTick = () => {
        const absolute = addXY(this.position, this.g.camera.offset);
        if (this.left)
          this.g.dispatchEvent(new LeftMouseEvent(absolute));
        if (this.right)
          this.g.dispatchEvent(new RightMouseEvent(absolute));
      };
      this.left = false;
      this.right = false;
      this.position = xy(NaN, NaN);
      g.canvas.addEventListener("mousedown", this.onUpdate);
      g.canvas.addEventListener("mouseup", this.onUpdate);
      g.canvas.addEventListener("mousemove", this.onUpdate);
      g.canvas.addEventListener("mouseout", this.onReset, { passive: true });
      g.canvas.addEventListener("contextmenu", (e) => e.preventDefault());
      g.addEventListener("Tick", this.onTick, { passive: true });
    }
  };

  // src/tools/euclideanDistance.ts
  function euclideanDistance(a, b) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  }

  // src/tools/makeCylinderPath.ts
  function makeCylinderPath(x, y, radius, height) {
    const path = new Path2D();
    path.ellipse(x, y, radius, radius / 2, 0, 0, Math.PI);
    path.ellipse(x, y - height, radius, radius / 2, 0, Math.PI, Math.PI * 2);
    path.lineTo(x + radius, y);
    return path;
  }

  // src/components/PlayerShot.ts
  var PlayerShot = class {
    constructor(g, position, angle, velocity, radius, timeToLive) {
      this.g = g;
      this.position = position;
      this.angle = angle;
      this.velocity = velocity;
      this.radius = radius;
      this.onRemove = () => {
        this.g.render.delete(this);
        this.g.removeEventListener("Tick", this.onTick);
      };
      this.onTick = ({ detail: { step } }) => {
        const move = this.velocity * step;
        this.position = addXY(this.position, vectorXY(this.angle, move));
      };
      g.render.add(this);
      this.removeTimer = g.fuse.add(timeToLive, this.onRemove);
      g.addEventListener("Tick", this.onTick, { passive: true });
    }
    draw(ctx, o) {
      const path = makeCylinderPath(o.x, o.y, this.radius, this.radius);
      ctx.fillStyle = "red";
      ctx.fill(path);
      ctx.strokeStyle = "orange";
      ctx.stroke(path);
    }
  };

  // src/components/Player.ts
  var Player = class {
    constructor(g, position = xy(0, 0), radius = 30, height = 70, heading = 0, moveSpeed = 1, attackDelay = 200, attackTime = 600, projectileVelocity = 2) {
      this.g = g;
      this.position = position;
      this.radius = radius;
      this.height = height;
      this.heading = heading;
      this.moveSpeed = moveSpeed;
      this.attackDelay = attackDelay;
      this.attackTime = attackTime;
      this.projectileVelocity = projectileVelocity;
      this.onLeft = ({ detail }) => {
        if (this.canMove && euclideanDistance(this.position, detail) > this.radius)
          this.destination = detail;
      };
      this.onRight = ({ detail }) => {
        this.destination = void 0;
        this.target = detail;
      };
      this.onTick = ({ detail: { step } }) => {
        const { position, moveSpeed, attacking, target, destination } = this;
        if (attacking == null ? void 0 : attacking.active)
          return;
        if (target) {
          this.attacking = this.g.fuse.add(this.attackTime, this.onAttackFinish);
          this.g.fuse.add(this.attackDelay, this.onAttackLaunch);
          this.canMove = false;
        }
        if (destination) {
          const distance = euclideanDistance(position, destination);
          const angle = betweenXY(destination, position);
          const move = Math.min(distance, moveSpeed * step);
          this.heading = angle;
          this.position = addXY(position, vectorXY(angle, move));
          if (distance <= move)
            this.destination = void 0;
        }
      };
      this.onAttackLaunch = () => {
        if (this.target) {
          new PlayerShot(
            this.g,
            this.position,
            betweenXY(this.target, this.position),
            this.projectileVelocity,
            8,
            3e3
          );
        }
      };
      this.onAttackFinish = () => {
        this.canMove = true;
        this.target = void 0;
      };
      this.canMove = true;
      g.render.add(this);
      g.addEventListener("LeftMouse", this.onLeft, { passive: true });
      g.addEventListener("RightMouse", this.onRight, { passive: true });
      g.addEventListener("Tick", this.onTick, { passive: true });
    }
    draw(ctx, o) {
      const path = makeCylinderPath(o.x, o.y, this.radius, this.height);
      ctx.fillStyle = "blue";
      ctx.fill(path);
      ctx.strokeStyle = "skyblue";
      ctx.lineWidth = 2;
      ctx.stroke(path);
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
      this.render = /* @__PURE__ */ new Set();
      this.size = new CanvasResizer(canvas);
      this.fpsCounter = new FPSCounter(this);
      this.fuse = new FuseManager(this);
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
