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
  var AnimationTriggerEvent = class extends CustomEvent {
    constructor(controller, trigger) {
      super("AnimationTrigger", { detail: { controller, trigger } });
    }
  };
  var CanvasResizeEvent = class extends CustomEvent {
    constructor(width, height) {
      super("CanvasResize", { detail: { width, height } });
    }
  };
  var JoypadButtonEvent = class extends CustomEvent {
    constructor(detail) {
      super("JoypadButton", { detail });
    }
  };
  var JoypadMoveEvent = class extends CustomEvent {
    constructor(detail) {
      super("JoypadMove", { detail });
    }
  };
  var LeftMouseEvent = class extends CustomEvent {
    constructor(detail) {
      super("LeftMouse", { detail });
    }
  };
  var LoadingEvent = class extends CustomEvent {
    constructor(now, max) {
      super("Loading", { detail: { now, max } });
    }
  };
  var ProcessInputEvent = class extends CustomEvent {
    constructor() {
      super("ProcessInput");
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

  // src/components/JoypadHandler.ts
  var JoypadHandler = class {
    constructor(g, axisThreshold = 0.1) {
      this.g = g;
      this.axisThreshold = axisThreshold;
      this.onConnect = (e) => {
        this.connect(e.gamepad.index);
      };
      this.onProcessInput = () => {
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
      this.gamepad = NaN;
      window.addEventListener("gamepadconnected", this.onConnect);
    }
    connect(index) {
      this.gamepad = index;
      this.g.addEventListener("ProcessInput", this.onProcessInput);
    }
    disconnect() {
      this.gamepad = NaN;
      this.g.removeEventListener("ProcessInput", this.onProcessInput);
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
      this.onProcessInput = () => {
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
      g.addEventListener("ProcessInput", this.onProcessInput, { passive: true });
    }
  };

  // src/img/diablo-rogue-lightarmour-bow.png
  var diablo_rogue_lightarmour_bow_default = "./diablo-rogue-lightarmour-bow-RBMJG63H.png";

  // src/animations/tools.ts
  var chars = "abcdefghijklmnopqrstuvwxyz";
  var loop = (data) => ({
    frames: data.frames,
    loopTo: 0
  });
  function makeAnimation(prefix, count, duration, sx, sy, w, h, processor = (data) => data) {
    const sprites = [];
    const frames = [];
    let x = sx;
    for (let i = 0; i < count; i++) {
      sprites.push([
        `${prefix}${chars[i]}`,
        { position: xy(x, sy), size: xy(w, h) }
      ]);
      x += w;
      frames.push({ id: `${prefix}${chars[i]}`, duration });
    }
    return { sprites, animation: [prefix, processor({ frames })] };
  }
  function makeSpriteSheet(url, globalOffset, dataArray) {
    return {
      url,
      globalOffset,
      sprites: Object.fromEntries(dataArray.flatMap((a) => a.sprites)),
      animations: Object.fromEntries(dataArray.map((a) => a.animation))
    };
  }

  // src/animations/Rogue.ts
  var AttackRelease = "attack.release";
  var AttackOver = "attack.over";
  var RogueFire = (data) => ({
    frames: data.frames.map(
      (frame, i) => i === 7 ? { id: frame.id, duration: frame.duration, trigger: AttackRelease } : frame
    ),
    endTrigger: AttackOver,
    offset: xy(-64, -108)
  });
  var RogueSpriteSheet = makeSpriteSheet(diablo_rogue_lightarmour_bow_default, xy(-48, -76), [
    makeAnimation("idle2", 8, 100, 0, 1046, 96, 94, loop),
    makeAnimation("idle1", 8, 100, 0, 1143, 96, 94, loop),
    makeAnimation("idle4", 8, 100, 0, 1240, 96, 94, loop),
    makeAnimation("idle7", 8, 100, 0, 1337, 96, 94, loop),
    makeAnimation("idle8", 8, 100, 0, 1434, 96, 94, loop),
    makeAnimation("idle9", 8, 100, 0, 1531, 96, 94, loop),
    makeAnimation("idle6", 8, 100, 0, 1628, 96, 94, loop),
    makeAnimation("idle3", 8, 100, 0, 1725, 96, 94, loop),
    makeAnimation("move2", 8, 50, 2690, 1046, 96, 94, loop),
    makeAnimation("move1", 8, 50, 2690, 1143, 96, 94, loop),
    makeAnimation("move4", 8, 50, 2690, 1240, 96, 94, loop),
    makeAnimation("move7", 8, 50, 2690, 1337, 96, 94, loop),
    makeAnimation("move8", 8, 50, 2690, 1434, 96, 94, loop),
    makeAnimation("move9", 8, 50, 2690, 1531, 96, 94, loop),
    makeAnimation("move6", 8, 50, 2690, 1628, 96, 94, loop),
    makeAnimation("move3", 8, 50, 2690, 1725, 96, 94, loop),
    makeAnimation("fire2", 12, 50, 0, 8, 128, 126, RogueFire),
    makeAnimation("fire1", 12, 50, 0, 137, 128, 126, RogueFire),
    makeAnimation("fire4", 12, 50, 0, 266, 128, 126, RogueFire),
    makeAnimation("fire7", 12, 50, 0, 395, 128, 126, RogueFire),
    makeAnimation("fire8", 12, 50, 0, 524, 128, 126, RogueFire),
    makeAnimation("fire9", 12, 50, 0, 653, 128, 126, RogueFire),
    makeAnimation("fire6", 12, 50, 0, 782, 128, 126, RogueFire),
    makeAnimation("fire3", 12, 50, 0, 911, 128, 126, RogueFire)
  ]);

  // src/tools/euclideanDistance.ts
  function euclideanDistance(a, b) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  }

  // src/tools/getOctant.ts
  var octantAngles = [
    -7 * Math.PI / 8,
    -5 * Math.PI / 8,
    -3 * Math.PI / 8,
    -1 * Math.PI / 8,
    1 * Math.PI / 8,
    3 * Math.PI / 8,
    5 * Math.PI / 8,
    7 * Math.PI / 8
  ];
  var octantIndices = [7, 8, 9, 6, 3, 2, 1];
  function getOctant(angle) {
    for (let i = 0; i < octantAngles.length; i++) {
      const left = octantAngles[i];
      const right = octantAngles[i + 1];
      if (angle >= left && angle < right)
        return octantIndices[i];
    }
    return 4;
  }

  // src/components/AnimationController.ts
  var AnimationController = class {
    constructor(g, sheet, animation) {
      this.g = g;
      this.sheet = sheet;
      this.onTick = ({ detail: { step } }) => {
        this.spriteDuration -= step;
        if (this.spriteDuration <= 0)
          this.nextFrame();
      };
      this.currentFrameIndex = 0;
      this.spriteDuration = 0;
      this.play(animation);
      g.res.loadImage(sheet.url).then((img) => this.img = img);
      g.addEventListener("Tick", this.onTick, { passive: true });
    }
    get offset() {
      var _a;
      const a = this.sheet.animations[this.currentAnimation];
      return (_a = a.offset) != null ? _a : this.sheet.globalOffset;
    }
    trigger(trigger) {
      this.g.dispatchEvent(new AnimationTriggerEvent(this, trigger));
    }
    loadFrame() {
      const f = this.sheet.animations[this.currentAnimation].frames[this.currentFrameIndex];
      this.spriteDuration = f.duration;
      if (f.trigger)
        this.trigger(f.trigger);
    }
    nextFrame() {
      this.currentFrameIndex++;
      const a = this.sheet.animations[this.currentAnimation];
      if (this.currentFrameIndex >= a.frames.length) {
        if (typeof a.loopTo !== "undefined") {
          this.currentFrameIndex = a.loopTo;
        } else if (a.endTrigger)
          return this.trigger(a.endTrigger);
      }
      this.loadFrame();
    }
    checkAnim(animation) {
      if (!this.sheet.animations[animation]) {
        console.warn(`tried to play animation: ${animation}`);
        return true;
      }
    }
    play(animation) {
      if (this.checkAnim(animation))
        return;
      this.currentAnimation = animation;
      this.currentFrameIndex = 0;
      this.loadFrame();
    }
    shift(animation) {
      if (this.checkAnim(animation))
        return;
      this.currentAnimation = animation;
    }
    draw(ctx, o) {
      const f = this.sheet.animations[this.currentAnimation].frames[this.currentFrameIndex];
      const s = this.sheet.sprites[f.id];
      const { x: sx, y: sy } = s.position;
      const { x: w, y: h } = s.size;
      const { x: dx, y: dy } = o;
      const { x: ox, y: oy } = this.offset;
      ctx.drawImage(
        this.img,
        sx,
        sy,
        w,
        h,
        Math.round(dx + ox),
        Math.round(dy + oy),
        w,
        h
      );
    }
  };

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
      const path = makeCylinderPath(o.x, o.y - 20, this.radius, this.radius);
      ctx.fillStyle = "red";
      ctx.fill(path);
      ctx.strokeStyle = "orange";
      ctx.stroke(path);
    }
  };

  // src/components/Player.ts
  var Player = class {
    constructor(g, position = xy(0, 0), radius = 25, height = 55, heading = 0, moveSpeed = 0.6, projectileVelocity = 1.4) {
      this.g = g;
      this.position = position;
      this.radius = radius;
      this.height = height;
      this.heading = heading;
      this.moveSpeed = moveSpeed;
      this.projectileVelocity = projectileVelocity;
      this.onLeft = ({ detail }) => {
        if (euclideanDistance(detail, this.position) > this.radius)
          this.move = { type: "mouse", target: detail };
        else
          this.heading = betweenXY(detail, this.position);
      };
      this.onRight = ({ detail }) => {
        if (!this.attacking)
          this.attack = { type: "mouse", target: detail };
      };
      this.onJoypadMove = ({ detail }) => {
        this.move = { type: "pad", angle: detail };
        this.heading = detail;
      };
      this.onJoypadButton = ({ detail }) => {
        if (detail === 0 && !this.attacking)
          this.attack = { type: "pad", angle: this.heading };
      };
      this.onTick = ({ detail: { step } }) => {
        const { position, moveSpeed, attack, move } = this;
        if (!this.canAct)
          return;
        if (attack) {
          this.heading = attack.type === "mouse" ? betweenXY(attack.target, position) : attack.angle;
          this.animate("fire");
          this.attacking = true;
          return;
        }
        if (move) {
          const maxDistance = move.type === "mouse" ? euclideanDistance(move.target, position) : Infinity;
          const angle = move.type === "mouse" ? betweenXY(move.target, position) : move.angle;
          const amount = Math.min(maxDistance, moveSpeed * step);
          this.heading = angle;
          this.position = addXY(position, vectorXY(angle, amount));
          if (maxDistance <= amount || move.type === "pad")
            this.move = void 0;
        }
      };
      this.onAnimationTrigger = ({
        detail: { controller, trigger }
      }) => {
        if (controller === this.anim)
          switch (trigger) {
            case AttackRelease:
              return this.onAttackLaunch();
            case AttackOver:
              return this.onAttackFinish();
          }
      };
      this.onAttackLaunch = () => {
        const { attack, position } = this;
        if (attack)
          new PlayerShot(
            this.g,
            this.position,
            attack.type === "mouse" ? betweenXY(attack.target, position) : attack.angle,
            this.projectileVelocity,
            8,
            3e3
          );
      };
      this.onAttackFinish = () => {
        this.attacking = false;
        this.attack = void 0;
        this.animate("idle");
      };
      this.anim = new AnimationController(g, RogueSpriteSheet, "idle2");
      this.prefix = "idle";
      this.attacking = false;
      g.render.add(this);
      g.addEventListener("LeftMouse", this.onLeft, { passive: true });
      g.addEventListener("RightMouse", this.onRight, { passive: true });
      g.addEventListener("JoypadButton", this.onJoypadButton, { passive: true });
      g.addEventListener("JoypadMove", this.onJoypadMove, { passive: true });
      g.addEventListener("Tick", this.onTick, { passive: true });
      g.addEventListener("AnimationTrigger", this.onAnimationTrigger, {
        passive: true
      });
    }
    animate(prefix) {
      const octant = getOctant(this.heading);
      const id = `${prefix}${octant}`;
      if (prefix === "fire" || this.prefix === "fire")
        this.anim.play(id);
      else
        this.anim.shift(id);
      this.prefix = prefix;
    }
    get canAct() {
      return !this.attacking;
    }
    draw(ctx, o) {
      if (!this.attacking)
        this.animate(this.move ? "move" : "idle");
      this.anim.draw(ctx, o);
    }
  };

  // src/components/ResourceManager.ts
  var ResourceManager = class {
    constructor(g) {
      this.g = g;
      this.promises = /* @__PURE__ */ new Map();
      this.loaders = [];
      this.loaded = 0;
      this.loading = 0;
    }
    get loadingText() {
      if (this.loaded < this.loading)
        return `Loading: ${this.loaded} / ${this.loading}`;
    }
    report() {
      this.g.dispatchEvent(new LoadingEvent(this.loaded, this.loading));
    }
    start(src, promise) {
      this.loading++;
      this.report();
      this.promises.set(src, promise);
      this.loaders.push(
        promise.then((arg) => {
          this.loaded++;
          this.report();
          return arg;
        })
      );
      return promise;
    }
    loadImage(src) {
      const res = this.promises.get(src);
      if (res)
        return res;
      return this.start(
        src,
        new Promise((resolve) => {
          const img = new Image();
          img.src = src;
          img.addEventListener("load", () => resolve(img));
        })
      );
    }
  };

  // src/Engine.ts
  var Engine = class extends EventTarget {
    constructor(canvas, ctx) {
      super();
      this.canvas = canvas;
      this.ctx = ctx;
      this.tick = (step) => {
        this.ctx.clearRect(0, 0, this.size.width, this.size.height);
        const loadingText = this.res.loadingText;
        if (loadingText) {
          this.ctx.font = "64px sans-serif";
          this.ctx.fillStyle = "white";
          this.ctx.textAlign = "center";
          this.ctx.textBaseline = "middle";
          this.ctx.fillText(loadingText, this.size.width / 2, this.size.height / 2);
          return;
        }
        this.dispatchEvent(new ProcessInputEvent());
        this.dispatchEvent(new TickEvent(step));
        this.dispatchEvent(new RenderEvent(this.ctx));
      };
      this.render = /* @__PURE__ */ new Set();
      this.res = new ResourceManager(this);
      this.size = new CanvasResizer(canvas);
      this.fpsCounter = new FPSCounter(this);
      this.fuse = new FuseManager(this);
      this.player = new Player(this);
      this.camera = new Camera(this);
      this.mouse = new MouseHandler(this);
      this.joypad = new JoypadHandler(this);
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
