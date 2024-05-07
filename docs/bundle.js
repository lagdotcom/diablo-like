"use strict";
(() => {
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
  function eqXY(a, b) {
    return a.x === b.x && a.y === b.y;
  }
  function roundXY({ x, y }) {
    return { x: Math.round(x), y: Math.round(y) };
  }
  function eqRoundXY(a, b) {
    return eqXY(roundXY(a), roundXY(b));
  }
  function invalidXY({ x, y }) {
    return isNaN(x) || isNaN(y);
  }
  function printXY(pos) {
    if (invalidXY(pos))
      return "--";
    return `${pos.x.toFixed(1)},${pos.y.toFixed(1)}`;
  }

  // src/components/CanvasResizer.ts
  var CanvasResizer = class {
    constructor(canvas) {
      this.canvas = canvas;
      this.resize = () => {
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
  };

  // src/tools/setFont.ts
  function setFont(ctx, font, colour, alignX, alignY) {
    ctx.font = font;
    ctx.fillStyle = colour;
    ctx.textAlign = alignX;
    ctx.textBaseline = alignY;
  }

  // src/components/DebugManager.ts
  var DebugManager = class {
    constructor(e, size, flags) {
      this.size = size;
      this.flags = flags;
      this.onRender = ({ detail: { ctx } }) => {
        const x = this.size.width - 120;
        let y = 100;
        setFont(ctx, "12px sans-serif", "white", "left", "top");
        for (const line of this.lines)
          ctx.fillText(line, x, y += 20);
      };
      this.lines = [];
      e.addEventListener("Render", this.onRender, { passive: true });
    }
    toggle(key) {
      this.flags[key] = !this.flags[key];
    }
    add(line) {
      this.lines.push(line);
    }
    reset() {
      this.lines = [];
    }
  };

  // src/components/FuseManager.ts
  var FuseManager = class {
    constructor(e) {
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
      e.addEventListener("Tick", this.onTick);
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

  // src/tools/euclideanDistance.ts
  function euclideanDistance(a, b) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  }

  // src/tools/isDefined.ts
  function isDefined(object) {
    return typeof object !== "undefined";
  }

  // src/pathfinding/PriorityQueue.ts
  var PriorityQueue = class {
    constructor() {
      this.list = [];
      this.dirty = false;
    }
    put(location, priority) {
      this.list.push({ location, priority });
      this.dirty = true;
    }
    sort() {
      this.list.sort((a, b) => a.priority - b.priority);
      this.dirty = false;
    }
    get() {
      if (this.dirty)
        this.sort();
      const item = this.list.shift();
      if (!item)
        throw new Error("queue is empty");
      return item.location;
    }
    empty() {
      return this.list.length === 0;
    }
  };

  // src/pathfinding/GridLocation.ts
  var GridLocation = class {
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }
  };

  // src/pathfinding/WeightedGraph.ts
  var ROOT2 = Math.sqrt(2);
  var WeightedGraph = class {
    constructor(blocked) {
      this.locations = /* @__PURE__ */ new Map();
      this.blocked = new Set(Array.from(blocked, (e) => this.at(e.x, e.y)));
    }
    isNavigable(pos) {
      return !this.blocked.has(pos);
    }
    at(x, y) {
      const tag = `${x},${y}`;
      const old = this.locations.get(tag);
      if (old)
        return old;
      const loc = new GridLocation(x, y);
      this.locations.set(tag, loc);
      return loc;
    }
    *neighbours(loc) {
      for (let y = -1; y <= 1; y++)
        for (let x = -1; x <= 1; x++) {
          if (x || y) {
            const pos = this.at(loc.x + x, loc.y + y);
            if (this.isNavigable(pos))
              yield pos;
          }
        }
    }
    cost(a, b) {
      const ex = a.x !== b.x;
      const ey = a.y !== b.y;
      if (ex && ey)
        return ROOT2;
      return 1;
    }
  };

  // src/pathfinding/astar.ts
  var CrashMap = class extends Map {
    getOrDie(key) {
      const value = super.get(key);
      if (typeof value === "undefined")
        throw new Error(`No such key: ${key}`);
      return value;
    }
  };
  function heuristic(a, b) {
    return euclideanDistance(a, b);
  }
  function aStarSearch(graph, start, goal, max) {
    const frontier = new PriorityQueue();
    frontier.put(start, 0);
    const cameFrom = /* @__PURE__ */ new Map();
    const costSoFar = new CrashMap([[start, 0]]);
    while (!frontier.empty()) {
      const current = frontier.get();
      if (current == goal)
        break;
      for (const next of graph.neighbours(current)) {
        const newCost = costSoFar.getOrDie(current) + graph.cost(current, next);
        if (newCost > max)
          continue;
        const nextCost = costSoFar.get(next);
        if (!isDefined(nextCost) || newCost < nextCost) {
          costSoFar.set(next, newCost);
          const priority = newCost + heuristic(next, goal);
          frontier.put(next, priority);
          cameFrom.set(next, current);
        }
      }
    }
    return { cameFrom, costSoFar };
  }
  function getAStarPath(blocked, from, to) {
    const graph = new WeightedGraph(blocked);
    const start = graph.at(from.x, from.y);
    const goal = graph.at(to.x, to.y);
    const max = euclideanDistance(from, to) + 10;
    const { cameFrom, costSoFar } = aStarSearch(graph, start, goal, max);
    const tiles = [];
    let current = goal;
    while (current) {
      tiles.push(current);
      current = cameFrom.get(current);
    }
    return { tiles, costSoFar };
  }

  // src/tools/Cached.ts
  var Cached = class {
    constructor(generator) {
      this.generator = generator;
    }
    get isComputed() {
      return isDefined(this.computed);
    }
    get() {
      const { computed, generator } = this;
      if (isDefined(computed))
        return computed;
      const value = generator();
      this.computed = value;
      return value;
    }
    clear() {
      this.computed = void 0;
    }
  };

  // src/components/PathManager.ts
  var PathManager = class {
    constructor(player, enemies) {
      this.player = player;
      this.enemies = enemies;
      this.generateEnemyPositions = () => new Set(Array.from(this.enemies, (e) => e.positionRounded));
      this.generatePlayerPath = () => {
        const { enemyPositions, destination, position } = this;
        if (invalidXY(destination) || invalidXY(position))
          return;
        return getAStarPath(enemyPositions.get(), position, destination);
      };
      this.destination = xy(NaN, NaN);
      this.position = xy(NaN, NaN);
      this.enemyPositions = new Cached(this.generateEnemyPositions);
      this.path = new Cached(this.generatePlayerPath);
    }
    getPlayerPath(destination) {
      if (!eqXY(this.position, this.player.positionRounded)) {
        this.position = this.player.positionRounded;
        this.path.clear();
      }
      if (!eqRoundXY(this.destination, destination)) {
        this.destination = destination;
        this.path.clear();
      }
      return this.path.get();
    }
  };

  // src/components/ResourceManager.ts
  var ResourceManager = class {
    constructor(e) {
      this.e = e;
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
      this.e.dispatchEvent(new LoadingEvent(this.loaded, this.loading));
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

  // src/components/AnimationController.ts
  var AnimationController = class {
    constructor(e, res, sheet, animation) {
      this.e = e;
      this.res = res;
      this.sheet = sheet;
      this.onTick = ({ detail: { step } }) => {
        this.spriteDuration -= step;
        if (this.spriteDuration <= 0)
          this.nextFrame();
      };
      this.currentFrameIndex = 0;
      this.spriteDuration = 0;
      this.play(animation);
      res.loadImage(sheet.url).then((img) => this.img = img);
      e.addEventListener("Tick", this.onTick, { passive: true });
    }
    get offset() {
      var _a;
      const a = this.sheet.animations[this.currentAnimation];
      return (_a = a.offset) != null ? _a : this.sheet.globalOffset;
    }
    trigger(trigger) {
      this.e.dispatchEvent(new AnimationTriggerEvent(this, trigger));
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
    draw(ctx, o, showOutline = false) {
      const f = this.sheet.animations[this.currentAnimation].frames[this.currentFrameIndex];
      const s = this.sheet.sprites[f.id];
      const { x: sx, y: sy } = s.position;
      const { x: w, y: h } = s.size;
      const { x: ox1, y: oy1 } = o;
      const { x: ox2, y: oy2 } = this.offset;
      const ox = Math.round(ox1 + ox2);
      const oy = Math.round(oy1 + oy2);
      ctx.globalAlpha = 1;
      ctx.drawImage(this.img, sx, sy, w, h, ox, oy, w, h);
      if (showOutline) {
        ctx.strokeStyle = "white";
        ctx.strokeRect(ox, oy, w, h);
      }
    }
  };

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

  // src/entities/EntityBase.ts
  var EntityBase = class {
    constructor(e, res, render, spriteSheet, startAnimation, resetAnimations, position, radius, height, heading = 0) {
      this.e = e;
      this.position = position;
      this.radius = radius;
      this.height = height;
      this.heading = heading;
      this.prefix = startAnimation;
      this.anim = new AnimationController(
        e,
        res,
        spriteSheet,
        `${startAnimation}2`
      );
      this.resetPrefixes = new Set(resetAnimations);
      render.add(this);
    }
    get positionRounded() {
      return roundXY(this.position);
    }
    animate(prefix) {
      const octant = getOctant(this.heading);
      const id = `${prefix}${octant}`;
      if (this.prefix !== prefix && (this.resetPrefixes.has(prefix) || this.resetPrefixes.has(this.prefix)))
        this.anim.play(id);
      else
        this.anim.shift(id);
      this.prefix = prefix;
    }
    draw(ctx, o, fl) {
      this.anim.draw(ctx, o, fl.outline);
    }
  };

  // src/entities/Fallen.ts
  var Fallen = class extends EntityBase {
    constructor(e, player, render, res, position = xy(0, 0), heading = 0, attackRange = 1) {
      super(
        e,
        res,
        render,
        FallenSpriteSheet,
        "idle",
        ["move"],
        position,
        1,
        1,
        heading
      );
      this.player = player;
      this.attackRange = attackRange;
      this.onTick = () => {
        const { position, player, radius, attackRange } = this;
        this.heading = betweenXY(player.position, position);
        const distance = euclideanDistance(player.position, position);
        const moving = distance > player.radius + radius + attackRange;
        this.animate(moving ? "move" : "idle");
      };
      e.addEventListener("Tick", this.onTick, { passive: true });
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

  // src/tools/makeTilePath.ts
  function makeTilePath(proj, position) {
    const a = proj.worldToScreen(addXY(position, { x: -0.5, y: -0.5 }));
    const b = proj.worldToScreen(addXY(position, { x: 0.5, y: -0.5 }));
    const c = proj.worldToScreen(addXY(position, { x: 0.5, y: 0.5 }));
    const d = proj.worldToScreen(addXY(position, { x: -0.5, y: 0.5 }));
    const path = new Path2D();
    path.moveTo(a.x, a.y);
    path.lineTo(b.x, b.y);
    path.lineTo(c.x, c.y);
    path.lineTo(d.x, d.y);
    return path;
  }

  // src/components/PlayerShot.ts
  var PlayerShot = class {
    constructor(e, fuse, render, position, angle, velocity, radius, timeToLive) {
      this.e = e;
      this.render = render;
      this.position = position;
      this.angle = angle;
      this.velocity = velocity;
      this.radius = radius;
      this.onRemove = () => {
        this.render.delete(this);
        this.e.removeEventListener("Tick", this.onTick);
      };
      this.onTick = ({ detail: { step } }) => {
        const move = this.velocity * step;
        this.position = addXY(this.position, vectorXY(this.angle, move));
      };
      render.add(this);
      this.removeTimer = fuse.add(timeToLive, this.onRemove);
      e.addEventListener("Tick", this.onTick, { passive: true });
    }
    draw(ctx, offset, flags, camera) {
      const path = makeTilePath(camera, this.position);
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = "red";
      ctx.fill(path);
      ctx.strokeStyle = "orange";
      ctx.stroke(path);
    }
  };

  // src/tools/units.ts
  function tilesPerSecond(tps) {
    return tps / 1e3;
  }

  // src/entities/Player.ts
  var Player = class extends EntityBase {
    constructor(e, fuse, render, res, position, heading = 0, moveSpeed = tilesPerSecond(6), projectileVelocity = tilesPerSecond(12)) {
      super(
        e,
        res,
        render,
        RogueSpriteSheet,
        "idle",
        ["move", "fire"],
        position,
        1,
        1,
        heading
      );
      this.fuse = fuse;
      this.render = render;
      this.moveSpeed = moveSpeed;
      this.projectileVelocity = projectileVelocity;
      this.onLeft = ({ detail }) => {
        if (!eqXY(this.position, detail))
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
      this.attacking = false;
      e.addEventListener("LeftMouse", this.onLeft, { passive: true });
      e.addEventListener("RightMouse", this.onRight, { passive: true });
      e.addEventListener("JoypadButton", this.onJoypadButton, { passive: true });
      e.addEventListener("JoypadMove", this.onJoypadMove, { passive: true });
      e.addEventListener("Tick", this.onTick, { passive: true });
      e.addEventListener("AnimationTrigger", this.onAnimationTrigger, {
        passive: true
      });
    }
    get canAct() {
      return !this.attacking;
    }
    onAttackLaunch() {
      const { attack, position } = this;
      if (attack)
        new PlayerShot(
          this.e,
          this.fuse,
          this.render,
          this.position,
          attack.type === "mouse" ? betweenXY(attack.target, position) : attack.angle,
          this.projectileVelocity,
          1,
          3e3
        );
    }
    onAttackFinish() {
      this.attacking = false;
      this.attack = void 0;
      this.animate("idle");
    }
  };

  // src/inputs/DebugKeyHandler.ts
  var DebugFlagKeys = {
    c: "camera",
    f: "fps",
    m: "mouse",
    o: "outline",
    p: "path"
  };
  var DebugKeyHandler = class {
    constructor(e, camera, debug, mouse, path, size) {
      this.camera = camera;
      this.debug = debug;
      this.mouse = mouse;
      this.path = path;
      this.size = size;
      this.onKeyPress = ({ key }) => {
        const { debug } = this;
        const flag = DebugFlagKeys[key];
        if (flag)
          debug.toggle(flag);
      };
      this.onRender = ({ detail: { ctx, flags } }) => {
        const { camera, mouse, path, size } = this;
        ctx.globalAlpha = 1;
        setFont(ctx, "16px sans-serif", "white", "left", "bottom");
        ctx.fillText(
          "[C]amera, [F]PS, [M]ouse, [O]utline, [P]ath",
          8,
          size.height - 8
        );
        if (flags.path) {
          const result = path.getPlayerPath(mouse.position);
          if (!result)
            return;
          ctx.globalAlpha = 0.1;
          ctx.fillStyle = "white";
          for (const t of result.tiles) {
            const x = makeTilePath(camera, t);
            ctx.fill(x);
          }
          ctx.globalAlpha = 0.3;
          setFont(ctx, "8px sans-serif", "white", "center", "middle");
          for (const [pos, amount] of result.costSoFar) {
            const screen = camera.worldToScreen(pos);
            ctx.fillText(amount.toFixed(1), screen.x, screen.y);
          }
        }
      };
      window.addEventListener("keypress", this.onKeyPress, { passive: true });
      e.addEventListener("Render", this.onRender, { passive: true });
    }
  };

  // src/inputs/JoypadHandler.ts
  var JoypadHandler = class {
    constructor(e, axisThreshold = 0.1) {
      this.e = e;
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
      this.gamepad = NaN;
      window.addEventListener("gamepadconnected", this.onConnect, {
        passive: true
      });
    }
    connect(index) {
      this.gamepad = index;
      this.e.addEventListener("ProcessInput", this.onProcessInput, {
        passive: true
      });
    }
    disconnect() {
      this.gamepad = NaN;
      this.e.removeEventListener("ProcessInput", this.onProcessInput);
    }
  };

  // src/inputs/MouseHandler.ts
  var MouseHandler = class {
    constructor(e, camera, container, debug) {
      this.e = e;
      this.camera = camera;
      this.debug = debug;
      this.onUpdate = (e) => {
        this.left = !!(e.buttons & 1);
        this.right = !!(e.buttons & 2);
        this.screen = xy(e.x, e.y);
      };
      this.onReset = () => {
        this.left = false;
        this.right = false;
        this.screen = xy(NaN, NaN);
      };
      this.onProcessInput = () => {
        const { e, position, left, right, debug } = this;
        if (left)
          e.dispatchEvent(new LeftMouseEvent(position));
        if (right)
          e.dispatchEvent(new RightMouseEvent(position));
        if (debug.flags.mouse)
          debug.add(`mouse: ${printXY(position)}`);
      };
      this.left = false;
      this.right = false;
      this.screen = xy(NaN, NaN);
      container.addEventListener("pointerdown", this.onUpdate, { passive: true });
      container.addEventListener("pointerup", this.onUpdate, { passive: true });
      container.addEventListener("pointermove", this.onUpdate, { passive: true });
      container.addEventListener("pointerout", this.onReset, { passive: true });
      container.addEventListener("contextmenu", (e2) => e2.preventDefault());
      e.addEventListener("ProcessInput", this.onProcessInput, { passive: true });
    }
    get position() {
      return this.camera.screenToWorld(this.screen);
    }
  };

  // src/visuals/Camera.ts
  var Camera = class {
    constructor(e, debug, focusedObject, render, resizer, tileSize = 32) {
      this.debug = debug;
      this.focusedObject = focusedObject;
      this.render = render;
      this.tileSize = tileSize;
      this.onResize = ({ detail: { width, height } }) => {
        this.resize(width, height);
      };
      this.onTick = () => {
        const { debug, focus } = this;
        if (debug.flags.camera) {
          debug.add(`offset: ${printXY(this.offset)}`);
          debug.add(`focus: ${printXY(focus)}`);
        }
      };
      this.onRender = ({ detail: { ctx, flags } }) => {
        const { renderList } = this;
        for (const { object, offset } of renderList)
          object.draw(ctx, offset, flags, this);
      };
      this.resize(resizer.width, resizer.height);
      resizer.addEventListener("CanvasResize", this.onResize, { passive: true });
      e.addEventListener("Tick", this.onTick, { passive: true });
      e.addEventListener("Render", this.onRender, { passive: true });
    }
    resize(width, height) {
      this.size = xy(width, height);
      this.offset = xy(width / 2, height / 2);
    }
    get focus() {
      return this.focusedObject.position;
    }
    get renderList() {
      const list = [];
      for (const object of this.render) {
        const offset = this.worldToScreen(object.position);
        list.push({ object, offset });
      }
      return list.sort((a, b) => a.offset.y - b.offset.y);
    }
    screenToWorld(screen) {
      const { x: sx, y: sy } = subXY(screen, this.offset);
      const x = (2 * sy + sx) / (2 * this.tileSize);
      const y = (2 * sy - sx) / (2 * this.tileSize);
      return roundXY(addXY({ x, y }, this.focus));
    }
    worldToScreen(world) {
      const { x: wx, y: wy } = subXY(world, this.focus);
      const x = (wx - wy) * this.tileSize;
      const y = (wx + wy) * this.tileSize / 2;
      return addXY({ x, y }, this.offset);
    }
  };

  // src/visuals/FPSCounter.ts
  var FPSCounter = class {
    constructor(e, size, samples = 10) {
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
      this.onRender = ({ detail: { ctx, flags } }) => {
        if (!flags.fps)
          return;
        const { fps, x, y } = this;
        setFont(ctx, "24px sans-serif", "yellow", "end", "bottom");
        ctx.fillText(Math.round(fps).toString(), x, y);
      };
      this.steps = [];
      this.x = size.width - 8;
      this.y = size.height - 8;
      size.addEventListener("CanvasResize", this.onResize, { passive: true });
      e.addEventListener("Tick", this.onTick, { passive: true });
      e.addEventListener("Render", this.onRender, { passive: true });
    }
    get fps() {
      if (this.steps.length === 0)
        return 0;
      return 1e3 / (this.steps.reduce((p, c) => p + c, 0) / this.steps.length);
    }
  };

  // src/visuals/MapGrid.ts
  var MapGrid = class {
    constructor(e, camera, mouse, size) {
      this.camera = camera;
      this.mouse = mouse;
      this.size = size;
      this.onRender = ({ detail: { ctx } }) => {
        const { camera, mouse, size } = this;
        const { width: sw, height: sh } = size;
        const tl = camera.screenToWorld({ x: 0, y: 0 });
        const tr = camera.screenToWorld({ x: sw, y: 0 });
        const br = camera.screenToWorld({ x: sw, y: sh });
        const bl = camera.screenToWorld({ x: 0, y: sh });
        const minX = Math.min(tl.x, tr.x, br.x, bl.x);
        const maxX = Math.max(tl.x, tr.x, br.x, bl.x);
        const minY = Math.min(tl.y, tr.y, br.y, bl.y);
        const maxY = Math.max(tl.y, tr.y, br.y, bl.y);
        ctx.globalAlpha = 0.2;
        ctx.strokeStyle = "cyan";
        for (let y = minY - 0.5; y <= maxY; y++) {
          const a = camera.worldToScreen({ x: minX, y });
          const b = camera.worldToScreen({ x: maxX, y });
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
        for (let x = minX - 0.5; x <= maxX; x++) {
          const a = camera.worldToScreen({ x, y: minY });
          const b = camera.worldToScreen({ x, y: maxY });
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
        const path = makeTilePath(camera, mouse.position);
        ctx.fillStyle = "cyan";
        ctx.fill(path);
        ctx.globalAlpha = 1;
      };
      e.addEventListener("Render", this.onRender, { passive: true });
    }
  };

  // src/Engine.ts
  var Engine = class {
    constructor(canvas, ctx) {
      this.canvas = canvas;
      this.ctx = ctx;
      this.tick = (step) => {
        const { e, debug, ctx, res, size } = this;
        ctx.save();
        ctx.clearRect(0, 0, size.width, size.height);
        const loadingText = res.loadingText;
        if (loadingText) {
          setFont(ctx, "64px sans-serif", "white", "center", "middle");
          ctx.fillText(loadingText, size.width / 2, size.height / 2);
          return;
        }
        debug.reset();
        e.dispatchEvent(new ProcessInputEvent());
        e.dispatchEvent(new TickEvent(step));
        e.dispatchEvent(new RenderEvent(ctx, debug.flags));
        ctx.restore();
      };
      this.e = new EventTarget();
      this.render = /* @__PURE__ */ new Set();
      this.res = new ResourceManager(this.e);
      this.size = new CanvasResizer(canvas);
      this.debug = new DebugManager(this.e, this.size, {
        camera: false,
        mouse: false,
        outline: false,
        path: true,
        fps: true
      });
      this.fpsCounter = new FPSCounter(this.e, this.size);
      this.fuse = new FuseManager(this.e);
      this.player = new Player(
        this.e,
        this.fuse,
        this.render,
        this.res,
        xy(0, 0)
      );
      this.camera = new Camera(
        this.e,
        this.debug,
        this.player,
        this.render,
        this.size
      );
      this.mouse = new MouseHandler(this.e, this.camera, this.canvas, this.debug);
      this.mapGrid = new MapGrid(this.e, this.camera, this.mouse, this.size);
      this.joypad = new JoypadHandler(this.e);
      this.enemies = /* @__PURE__ */ new Set([
        new Fallen(this.e, this.player, this.render, this.res, xy(10, 0)),
        new Fallen(this.e, this.player, this.render, this.res, xy(0, -10))
      ]);
      this.path = new PathManager(this.player, this.enemies);
      new DebugKeyHandler(
        this.e,
        this.camera,
        this.debug,
        this.mouse,
        this.path,
        this.size
      );
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
