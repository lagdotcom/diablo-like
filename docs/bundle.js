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
      this.onRender = ({ detail: { ctx, flags } }) => {
        const { renderList, g, offset } = this;
        for (const r of renderList) {
          const screen = subXY(g.projection.worldToScreen(r.position), offset);
          r.draw(ctx, screen, flags);
        }
      };
      this.size = g.size.xy;
      this.focus = g.projection.worldToScreen(g.player.position);
      g.size.addEventListener("CanvasResize", this.onResize, { passive: true });
      g.addEventListener("Render", this.onRender, { passive: true });
    }
    get halfSize() {
      return xy(this.size.x / 2, this.size.y / 2);
    }
    get offset() {
      return subXY(this.focus, this.halfSize);
    }
    get renderList() {
      const list = [];
      for (const r of this.g.render) {
        list.push(r);
      }
      return list.sort((a, b) => a.position.y - b.position.y);
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
    constructor(ctx, flags) {
      super("Render", { detail: { ctx, flags } });
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

  // src/tools/setFont.ts
  function setFont(ctx, font, colour, alignX, alignY) {
    ctx.font = font;
    ctx.fillStyle = colour;
    ctx.textAlign = alignX;
    ctx.textBaseline = alignY;
  }

  // src/components/DebugKeyHandler.ts
  var DebugKeyHandler = class {
    constructor(g) {
      this.g = g;
      window.addEventListener("keypress", (e) => {
        if (e.key === "h")
          g.renderFlags.hitBox = !g.renderFlags.hitBox;
        if (e.key === "a")
          g.renderFlags.attackBox = !g.renderFlags.attackBox;
      });
      g.addEventListener("Render", ({ detail: { ctx } }) => {
        setFont(ctx, "24px sans-serif", "white", "left", "bottom");
        ctx.fillText("[H]it box / [A]ttack box", 8, g.size.height - 8);
      });
    }
  };

  // src/components/FlatProjection.ts
  var FlatProjection = class {
    constructor(scaleY = 1, scaleH = 1) {
      this.scaleY = scaleY;
      this.scaleH = scaleH;
      this.headingOffset = 0;
    }
    screenToWorld(screen) {
      const { x, y } = screen;
      return { x, y: y * this.scaleY };
    }
    worldToScreen(logical) {
      const { x, y } = logical;
      return { x, y: y / this.scaleY };
    }
    getHeight(height) {
      return height / this.scaleH;
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
        const { fps, x, y } = this;
        setFont(ctx, "24px sans-serif", "yellow", "end", "bottom");
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

  // src/components/MapGrid.ts
  var MapGrid = class {
    constructor(g, size = 50) {
      this.g = g;
      this.size = size;
      this.onRender = ({ detail: { ctx } }) => {
        const { g, size } = this;
        const { camera, projection } = g;
        const sw = g.size.width / 2;
        const sh = g.size.height / 2;
        const tl = projection.screenToWorld({ x: -sw, y: -sh });
        const tr = projection.screenToWorld({ x: sw, y: -sh });
        const br = projection.screenToWorld({ x: sw, y: sh });
        const bl = projection.screenToWorld({ x: -sw, y: sh });
        const minX = Math.min(tl.x, tr.x, br.x, bl.x);
        const maxX = Math.max(tl.x, tr.x, br.x, bl.x);
        const minY = Math.min(tl.y, tr.y, br.y, bl.y);
        const maxY = Math.max(tl.y, tr.y, br.y, bl.y);
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = "cyan";
        for (let y = minY; y <= maxY; y += size) {
          const a = subXY(projection.worldToScreen({ x: minX, y }), camera.offset);
          const b = subXY(projection.worldToScreen({ x: maxX, y }), camera.offset);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
        for (let x = minX; x <= maxX; x += size) {
          const a = subXY(projection.worldToScreen({ x, y: minY }), camera.offset);
          const b = subXY(projection.worldToScreen({ x, y: maxY }), camera.offset);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      };
      g.addEventListener("Render", this.onRender, { passive: true });
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
      };
      this.onReset = () => {
        this.left = false;
        this.right = false;
      };
      this.onProcessInput = () => {
        const absolute = this.g.projection.screenToWorld(
          addXY(this.g.camera.offset, this.position)
        );
        if (this.left)
          this.g.dispatchEvent(new LeftMouseEvent(absolute));
        if (this.right)
          this.g.dispatchEvent(new RightMouseEvent(absolute));
      };
      this.left = false;
      this.right = false;
      this.position = xy(NaN, NaN);
      g.canvas.addEventListener("pointerdown", this.onUpdate, { passive: true });
      g.canvas.addEventListener("pointerup", this.onUpdate, { passive: true });
      g.canvas.addEventListener("pointermove", this.onUpdate, { passive: true });
      g.canvas.addEventListener("pointerout", this.onReset, { passive: true });
      g.canvas.addEventListener("contextmenu", (e) => e.preventDefault());
      g.addEventListener("ProcessInput", this.onProcessInput, { passive: true });
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

  // src/img/diablo-fallen-sword.png
  var diablo_fallen_sword_default = "./diablo-fallen-sword-PLZGE4HB.png";

  // src/animations/tools.ts
  var chars = "abcdefghijklmnopqrstuvwxyz";
  var loop = (data) => {
    data.loopTo = 0;
    return data;
  };
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

  // src/animations/Fallen.ts
  var FallenSpriteSheet = makeSpriteSheet(
    diablo_fallen_sword_default,
    xy(-68, -76),
    [
      makeAnimation("idle2", 12, 100, 3458, 8, 128, 94, loop),
      makeAnimation("idle1", 12, 100, 3458, 104, 128, 94, loop),
      makeAnimation("idle4", 12, 100, 3458, 200, 128, 94, loop),
      makeAnimation("idle7", 12, 100, 3458, 296, 128, 94, loop),
      makeAnimation("idle8", 12, 100, 3458, 392, 128, 94, loop),
      makeAnimation("idle9", 12, 100, 3458, 488, 128, 94, loop),
      makeAnimation("idle6", 12, 100, 3458, 584, 128, 94, loop),
      makeAnimation("idle3", 12, 100, 3458, 680, 128, 94, loop),
      makeAnimation("move2", 12, 100, 3330, 783, 128, 94, loop),
      makeAnimation("move1", 12, 100, 3330, 879, 128, 94, loop),
      makeAnimation("move4", 12, 100, 3330, 975, 128, 94, loop),
      makeAnimation("move7", 12, 100, 3330, 1071, 128, 94, loop),
      makeAnimation("move8", 12, 100, 3330, 1167, 128, 94, loop),
      makeAnimation("move9", 12, 100, 3330, 1263, 128, 94, loop),
      makeAnimation("move6", 12, 100, 3330, 1359, 128, 94, loop),
      makeAnimation("move3", 12, 100, 3330, 1455, 128, 94, loop)
    ]
  );

  // src/tools/euclideanDistance.ts
  function euclideanDistance(a, b) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
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
      const a = this.sheet.animations[animation];
      if (this.currentFrameIndex >= a.frames.length)
        this.currentFrameIndex = 0;
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

  // src/tools/drawOutlined.ts
  function drawOutlined(ctx, path, fill, stroke = fill, fillAlpha = 0.1, strokeAlpha = fillAlpha * 2, strokeWidth = 2) {
    ctx.globalAlpha = fillAlpha;
    ctx.fillStyle = fill;
    ctx.fill(path);
    ctx.globalAlpha = strokeAlpha;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeWidth;
    ctx.stroke(path);
    ctx.globalAlpha = 1;
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

  // src/tools/makeCylinderPath.ts
  function makeCylinderPath(proj, x, y, radius, height) {
    const radiusY = proj.getHeight(radius);
    const path = new Path2D();
    path.ellipse(x, y, radius, radiusY, 0, 0, Math.PI);
    path.ellipse(x, y - height, radius, radiusY, 0, Math.PI, Math.PI * 2);
    path.lineTo(x + radius, y);
    return path;
  }

  // src/entities/EntityBase.ts
  var EntityBase = class {
    constructor(g, spriteSheet, startAnimation, resetAnimations, position, radius, height, heading = 0) {
      this.g = g;
      this.position = position;
      this.radius = radius;
      this.height = height;
      this.heading = heading;
      this.prefix = startAnimation;
      this.anim = new AnimationController(g, spriteSheet, `${startAnimation}2`);
      this.resetPrefixes = new Set(resetAnimations);
      g.render.add(this);
    }
    animate(prefix) {
      const octant = getOctant(this.heading + this.g.projection.headingOffset);
      const id = `${prefix}${octant}`;
      if (this.prefix !== prefix && (this.resetPrefixes.has(prefix) || this.resetPrefixes.has(this.prefix)))
        this.anim.play(id);
      else
        this.anim.shift(id);
      this.prefix = prefix;
    }
    draw(ctx, o, fl) {
      if (fl.attackBox && this.attackRange) {
        const path = makeCylinderPath(
          this.g.projection,
          o.x,
          o.y,
          this.radius + this.attackRange,
          this.height
        );
        drawOutlined(ctx, path, "red");
      }
      if (fl.hitBox) {
        const path = makeCylinderPath(
          this.g.projection,
          o.x,
          o.y,
          this.radius,
          this.height
        );
        drawOutlined(ctx, path, "blue");
      }
      this.anim.draw(ctx, o);
    }
  };

  // src/entities/Fallen.ts
  var Fallen = class extends EntityBase {
    constructor(g, position = xy(0, 0), heading = 0, attackRange = 20) {
      super(g, FallenSpriteSheet, "idle", ["move"], position, 20, 25, heading);
      this.attackRange = attackRange;
      this.onTick = () => {
        const player = this.g.player;
        this.heading = betweenXY(player.position, this.position);
        const distance = euclideanDistance(player.position, this.position);
        const moving = distance > player.radius + this.radius + this.attackRange;
        this.animate(moving ? "move" : "idle");
      };
      g.addEventListener("Tick", this.onTick, { passive: true });
    }
  };

  // src/img/diablo-rogue-lightarmour-bow.png
  var diablo_rogue_lightarmour_bow_default = "./diablo-rogue-lightarmour-bow-RBMJG63H.png";

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
      const path = makeCylinderPath(
        this.g.projection,
        o.x,
        o.y - 20,
        this.radius,
        this.radius
      );
      ctx.fillStyle = "red";
      ctx.fill(path);
      ctx.strokeStyle = "orange";
      ctx.stroke(path);
    }
  };

  // src/entities/Player.ts
  var Player = class extends EntityBase {
    constructor(g, position, heading = 0, moveSpeed = 0.6, projectileVelocity = 1.4) {
      super(
        g,
        RogueSpriteSheet,
        "idle",
        ["move", "fire"],
        position,
        25,
        55,
        heading
      );
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
          else {
            this.animate("move");
            return;
          }
        }
        this.animate("idle");
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
      this.attacking = false;
      g.addEventListener("LeftMouse", this.onLeft, { passive: true });
      g.addEventListener("RightMouse", this.onRight, { passive: true });
      g.addEventListener("JoypadButton", this.onJoypadButton, { passive: true });
      g.addEventListener("JoypadMove", this.onJoypadMove, { passive: true });
      g.addEventListener("Tick", this.onTick, { passive: true });
      g.addEventListener("AnimationTrigger", this.onAnimationTrigger, {
        passive: true
      });
    }
    get canAct() {
      return !this.attacking;
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
          setFont(this.ctx, "64px sans-serif", "white", "center", "middle");
          this.ctx.fillText(loadingText, this.size.width / 2, this.size.height / 2);
          return;
        }
        this.dispatchEvent(new ProcessInputEvent());
        this.dispatchEvent(new TickEvent(step));
        this.dispatchEvent(new RenderEvent(this.ctx, this.renderFlags));
      };
      this.render = /* @__PURE__ */ new Set();
      this.renderFlags = { hitBox: false, attackBox: false };
      this.res = new ResourceManager(this);
      this.size = new CanvasResizer(canvas);
      this.projection = new FlatProjection();
      this.fpsCounter = new FPSCounter(this);
      this.fuse = new FuseManager(this);
      this.player = new Player(this, xy(0, 0));
      new MapGrid(this);
      this.camera = new Camera(this);
      this.mouse = new MouseHandler(this);
      this.joypad = new JoypadHandler(this);
      this.enemies = /* @__PURE__ */ new Set([
        new Fallen(this, xy(200, 0)),
        new Fallen(this, xy(-10, 120))
      ]);
      new DebugKeyHandler(this);
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
