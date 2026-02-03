class g {
  static #i = 96;
  static #r = 2048;
  static #n = Math.pow(this.#r / this.#i, 2);
  static get spriteSize() {
    return this.#i;
  }
  static get baseTextureSize() {
    return this.#r;
  }
  static get maxMemberCount() {
    return this.#n;
  }
  #e = [];
  #t = /* @__PURE__ */ new Map();
  #s() {
    return new PIXI.BaseRenderTexture({
      width: g.baseTextureSize,
      height: g.baseTextureSize
    });
  }
  #a() {
    const e = this.#e.length - 1, i = this.#e[e];
    if (!i || i[1] >= g.maxMemberCount) {
      const r = this.#s();
      return this.#e.push([r, 1]), [r, 0];
    }
    return this.#e[e][1] = i[1] + 1, i;
  }
  addToCache(e, i) {
    const r = this.#t.get(e);
    if (r)
      return r;
    const [n, s] = this.#a(), a = g.spriteSize, l = g.baseTextureSize / a, f = s % l, c = Math.floor(s / l), d = new PIXI.Rectangle(f * a, c * a, a, a), b = new PIXI.RenderTexture(n, d);
    return canvas.app.renderer.render(i, { renderTexture: b }), this.#t.set(e, b), b;
  }
  loadTexture(e) {
    return this.#t.get(e);
  }
}
function M(t, e, i) {
  let r = (n) => t(n, ...e);
  return i === void 0 ? r : Object.assign(r, { lazy: i, lazyArgs: e });
}
function S(t, e, i) {
  let r = t.length - e.length;
  if (r === 0) return t(...e);
  if (r === 1) return M(t, e, i);
  throw Error("Wrong number of arguments");
}
const I = { done: !1, hasNext: !1 }, j = (t) => ({ hasNext: !0, next: t, done: !1 });
function k(t, ...e) {
  let i = t, r = e.map((s) => "lazy" in s ? _(s) : void 0), n = 0;
  for (; n < e.length; ) {
    if (r[n] === void 0 || !P(i)) {
      let f = e[n];
      i = f(i), n += 1;
      continue;
    }
    let s = [];
    for (let f = n; f < e.length; f++) {
      let c = r[f];
      if (c === void 0 || (s.push(c), c.isSingle)) break;
    }
    let a = [];
    for (let f of i) if (O(f, a, s)) break;
    let { isSingle: l } = s.at(-1);
    i = l ? a[0] : a, n += s.length;
  }
  return i;
}
function O(t, e, i) {
  if (i.length === 0) return e.push(t), !1;
  let r = t, n = I, s = !1;
  for (let [a, l] of i.entries()) {
    let { index: f, items: c } = l;
    if (c.push(r), n = l(r, f, c), l.index += 1, n.hasNext) {
      if (n.hasMany ?? !1) {
        for (let d of n.next) if (O(d, e, i.slice(a + 1))) return !0;
        return s;
      }
      r = n.next;
    }
    if (!n.hasNext) break;
    n.done && (s = !0);
  }
  return n.hasNext && e.push(r), s;
}
function _(t) {
  let { lazy: e, lazyArgs: i } = t, r = e(...i);
  return Object.assign(r, { isSingle: e.single ?? !1, index: 0, items: [] });
}
function P(t) {
  return typeof t == "string" || typeof t == "object" && !!t && Symbol.iterator in t;
}
function F(...t) {
  return S($, t, C);
}
const $ = (t, e) => t.filter(e), C = (t) => (e, i, r) => t(e, i, r) ? { done: !1, hasNext: !0, next: e } : I;
function N(t, e) {
  return typeof t == "object" ? w(t, e) : M(w, [], R);
}
const w = (t, e) => e === void 0 ? t.flat() : t.flat(e), R = (t) => t === void 0 || t === 1 ? D : t <= 0 ? j : (e) => Array.isArray(e) ? { next: e.flat(t - 1), hasNext: !0, hasMany: !0, done: !1 } : { next: e, hasNext: !0, done: !1 }, D = (t) => Array.isArray(t) ? { next: t, hasNext: !0, hasMany: !0, done: !1 } : { next: t, hasNext: !0, done: !1 };
function v(t) {
  return t != null;
}
function p(t) {
  if (typeof t != "object" || !t) return !1;
  let e = Object.getPrototypeOf(t);
  return e === null || e === Object.prototype;
}
function X(t) {
  return typeof t == "string";
}
function B(...t) {
  return S(L, t);
}
const L = (t, e) => t.join(e);
function G(...t) {
  return S(V, t);
}
function V(t, e) {
  let i = {};
  for (let [r, n] of t.entries()) {
    let [s, a] = e(n, r, t);
    i[s] = a;
  }
  return i;
}
function q(t, ...e) {
  return k(e, N(), F(v), F(X), B(t));
}
const h = {
  id: "",
  groupLog: !1,
  current: void 0
}, u = {
  get id() {
    if (!h.id) throw new Error("Module needs to be registered.");
    return h.id;
  },
  get name() {
    if (!h.id) throw new Error("Module needsto be registered.");
    return this.current.title;
  },
  get current() {
    return h.current ??= game.modules.get(this.id);
  },
  get isDebug() {
    return foundry.utils.getProperty(CONFIG, `debug.${this.id}`) === !0;
  },
  Error(t) {
    return new Error(`
[${this.name}] ${t}`);
  },
  error(t, e) {
    let i = `[${this.name}] ${t}`;
    e instanceof Error ? i += `
${e.message}` : typeof e == "string" && (i += `
${e}`), console.error(i);
  },
  assert(t, e) {
    if (!t)
      throw this.Error(e);
  },
  log(...t) {
    h.groupLog ? console.log(...t) : console.log(`[${this.name}]`, ...t);
  },
  group(t) {
    this.groupEnd(), h.groupLog = !0, console.group(`[${this.name}] ${t}`);
  },
  groupEnd() {
    console.groupEnd(), h.groupLog = !1;
  },
  debug(...t) {
    this.isDebug && this.log(...t);
  },
  enableDebugMode() {
    this.isDebug || foundry.utils.setProperty(CONFIG, `debug.${this.id}`, !0);
  },
  path(...t) {
    const e = q(".", ...t);
    return e ? `${this.id}.${e}` : `${this.id}`;
  },
  register(t) {
    if (h.id) throw new Error("Module was already registered.");
    h.id = t;
  }
};
function y(t, ...e) {
  return t.getFlag(u.id, e.join("."));
}
function H(t, e, i) {
  return t.update({ flags: { [u.id]: e } }, i);
}
function Y(t, e) {
  return t.includes(e);
}
class W {
  static isStatement(e) {
    return p(e) ? this.isCompound(e) || this.isBinaryOp(e) : typeof e == "string" ? this.isAtomic(e) : !1;
  }
  static isAtomic(e) {
    return typeof e == "string" && e.length > 0 || this.isBinaryOp(e);
  }
  static #i = /* @__PURE__ */ new Set(["eq", "gt", "gte", "lt", "lte"]);
  static isBinaryOp(e) {
    if (!p(e)) return !1;
    const i = Object.entries(e);
    if (i.length > 1) return !1;
    const [r, n] = i[0];
    return this.#i.has(r) && Array.isArray(n) && n.length === 2 && typeof n[0] == "string" && ["string", "number"].includes(typeof n[1]);
  }
  static isCompound(e) {
    return p(e) && (this.#r(e) || this.#e(e) || this.#n(e) || this.#t(e) || this.#s(e) || this.#a(e) || this.#o(e) || this.#l(e));
  }
  static #r(e) {
    return Object.keys(e).length === 1 && Array.isArray(e.and) && e.and.every((i) => this.isStatement(i));
  }
  static #n(e) {
    return Object.keys(e).length === 1 && Array.isArray(e.nand) && e.nand.every((i) => this.isStatement(i));
  }
  static #e(e) {
    return Object.keys(e).length === 1 && Array.isArray(e.or) && e.or.every((i) => this.isStatement(i));
  }
  static #t(e) {
    return Object.keys(e).length === 1 && Array.isArray(e.xor) && e.xor.every((i) => this.isStatement(i));
  }
  static #s(e) {
    return Object.keys(e).length === 1 && Array.isArray(e.nor) && e.nor.every((i) => this.isStatement(i));
  }
  static #a(e) {
    return Object.keys(e).length === 1 && !!e.not && this.isStatement(e.not);
  }
  static #o(e) {
    return Object.keys(e).length === 2 && this.isStatement(e.if) && this.isStatement(e.then);
  }
  static #l(e) {
    return Object.keys(e).length === 1 && Array.isArray(e.iff) && e.iff.every((i) => this.isStatement(i));
  }
}
const o = foundry.data.fields, m = foundry.data.validation;
class ae extends o.SchemaField {
  initialize(e, i, r) {
    if (!e) return super.initialize(e, i, r);
    for (const s in e)
      e[s] === void 0 && delete e[s];
    const n = super.initialize(e, i, r);
    for (const s in n)
      e[s] === void 0 && delete e[s];
    return n;
  }
}
class oe extends o.SchemaField {
  _cleanType(e, i = {}) {
    i.source = i?.source ?? e;
    for (const [r, n] of this.entries())
      !(r in e) && i?.partial || (e[r] = n.clean(e[r], i), e[r] === void 0 && delete e[r]);
    return e;
  }
}
class le extends o.SchemaField {
  _cast(e) {
    return e;
  }
  _cleanType(e, i) {
    if (!p(e))
      throw Error(`${this.name} is not an object`);
    return super._cleanType(e, i);
  }
}
class ce extends o.StringField {
  _cast(e) {
    return e;
  }
}
class ue extends o.NumberField {
  _cast(e) {
    return e;
  }
}
class fe extends o.BooleanField {
  _cast(e) {
    return e === "true" ? !0 : e === "false" ? !1 : e === "null" || e === "" ? this.nullable ? null : !1 : typeof e == "object" ? !1 : !!e;
  }
  _toInput(e) {
    if (!this.nullable) return super._toInput(e);
    const i = String(e.value ?? null), r = [
      { value: "true", label: game.i18n.localize("Yes"), selected: i === "true" },
      { value: "false", label: game.i18n.localize("No"), selected: i === "false" },
      { value: "null", label: "", selected: i === "null" }
    ];
    return foundry.applications.fields.createSelectInput(
      foundry.utils.mergeObject(e, { value: i, options: r, dataset: { data: "JSON" } })
    );
  }
}
class de extends o.BooleanField {
  _cast(e) {
    return e;
  }
}
class U extends o.ArrayField {
  _cast(e) {
    return e;
  }
  _cleanType(e) {
    return Array.isArray(e) ? super._cleanType(e) : e;
  }
  initialize(e, i, r) {
    return Array.isArray(e) ? super.initialize(e, i, r) : this.nullable ? null : void 0;
  }
}
class he extends o.ArrayField {
  _validateElements(e, i) {
    const r = super._validateElements(e, i);
    if (!r) return r;
    for (const n of r.elements)
      e.splice(Number(n.id), 1);
    return r.unresolved = !1, r;
  }
}
class ge extends o.ObjectField {
  _cast(e) {
    return e;
  }
}
class pe extends o.DataField {
  static get _defaults() {
    return { ...super._defaults, choices: [] };
  }
  // Overriden to satisfy typescript types only
  constructor(e, i) {
    super(e, i);
  }
  /** Converts invalid string representations to valid non-string choices if they exist */
  _cleanType(e) {
    if (typeof e == "string" && !this.choices.includes(e)) {
      const i = this.choices.findIndex((r) => String(r) === e);
      return i >= 0 ? this.choices[i] : e;
    }
    return e;
  }
  _cast(e) {
    return e;
  }
  _validateType(e) {
    if (!(this.options.nullable && e === null) && !Y(this.choices, e))
      throw new Error(`${e} is not a valid choice`);
  }
  _toInput(e) {
    return e.choices ??= G(this.choices, (i) => [String(i), i]), o.StringField._prepareChoiceConfig(e), foundry.applications.fields.createSelectInput(e);
  }
}
class ye extends o.DataField {
  constructor(e, i) {
    super(i), this.fields = e;
  }
  _cast(e) {
    return typeof e == "string" && (e = e.trim()), e;
  }
  /**
   * Perform some cleaning while first checking that an upstream `_cast` won't convert a dog into a cat (or a number
   * into an array).
   */
  clean(e, i) {
    if (Array.isArray(e) && this.fields.some((r) => r instanceof o.ArrayField))
      return this.fields.find((n) => n instanceof U)?.clean(e, i) ?? e;
    if (p(e)) {
      const n = this.fields.find((s) => s instanceof o.SchemaField || s instanceof o.ObjectField)?.getInitialValue();
      if (!p(n)) return super.clean(e, i);
      for (const s of Object.keys(n))
        s in e || (e[s] = n[s]);
      return e;
    }
    return super.clean(e, i);
  }
  _validateType(e, i) {
    const r = [];
    for (const s of this.fields) {
      const a = s.validate(e, i);
      if (a instanceof m.DataModelValidationFailure)
        r.push({ field: s, result: a });
      else
        return !0;
    }
    const n = r.at(-1)?.result;
    return n ? Array.isArray(e) ? r.findLast((s) => s.field instanceof o.ArrayField)?.result ?? n : typeof e == "object" ? r.findLast((s) => s.field instanceof o.ObjectField || s.field instanceof o.SchemaField)?.result ?? n : n : !1;
  }
  initialize(e, i, r) {
    return this.fields.find((s) => !s.validate(e))?.initialize(e, i, r);
  }
}
class be extends o.DataField {
  /** A `PredicateStatement` is always required (not `undefined`) and never nullable */
  constructor(e = {}) {
    super({
      ...e,
      required: !0,
      nullable: !1,
      initial: void 0,
      validationError: "must be a recognized predication statement"
    });
  }
  _validateType(e) {
    return W.isStatement(e);
  }
  /** No casting is available for a predicate statement */
  _cast(e) {
    return e;
  }
  _cleanType(e) {
    return typeof e == "string" ? e.trim() : e;
  }
}
const x = class x extends o.ObjectField {
  constructor(e, i, r) {
    if (super(r), !this._isValidKeyFieldType(e))
      throw new Error("key field must be a StringField or a NumberField");
    if (this.keyField = e, !(i instanceof o.DataField))
      throw new Error(`${this.name} must have a DataField as its contained field`);
    this.valueField = i;
  }
  _isValidKeyFieldType(e) {
    if (e instanceof o.StringField || e instanceof o.NumberField) {
      if (e.options.required !== !0 || e.options.nullable === !0)
        throw new Error("key field must be required and non-nullable");
      return !0;
    }
    return !1;
  }
  _validateValues(e, i) {
    const r = new m.DataModelValidationFailure();
    for (const [n, s] of Object.entries(e)) {
      if (n.startsWith("-=") && i?.partial) continue;
      const a = this.keyField.validate(n, i);
      a && r.elements.push({ id: n, failure: a });
      const l = this.valueField.validate(s, i);
      l && r.elements.push({ id: `${n}-value`, failure: l });
    }
    if (r.elements.length)
      return r.elements.every((n) => n.id in e) ? r.unresolved = !1 : r.unresolved = r.elements.some((n) => n.failure.unresolved), r;
  }
  _cleanType(e, i) {
    for (const [r, n] of Object.entries(e))
      r.startsWith("-=") || (e[r] = this.valueField.clean(n, i));
    return e;
  }
  _validateType(e, i) {
    return p(e) ? this._validateValues(e, i) : new m.DataModelValidationFailure({ message: "must be an Object" });
  }
  initialize(e, i, r) {
    if (!e) return e;
    const l = (this.fieldPath.startsWith(i.schema.fieldPath + ".") ? this.fieldPath.substring(i.schema.fieldPath.length + 1) : this.fieldPath).split(".").reduce((c, d) => c ? c.fields[d] : null, i.validationFailures.fields)?.elements.map((c) => c.id) ?? [], f = {};
    for (const [c, d] of Object.entries(e))
      l.includes(c) || (f[c] = this.valueField.initialize(d, i, r));
    return f;
  }
};
x.recursive = !0;
let z = x;
class me extends o.DataField {
  constructor() {
    super({ required: !0, nullable: !0, initial: null });
  }
  _cast() {
    return null;
  }
}
const E = {
  get id() {
    return game.system.id;
  },
  get isPF2e() {
    return this.id === "pf2e";
  }
};
function K(t, e) {
  t.width = e, t.height = e;
}
function J(t) {
  return { x: Math.cos(t), y: Math.sin(t) };
}
function Q(t, e) {
  let i = 1, r = A(e, i);
  for (; t >= r.rowMax; )
    t -= r.rowMax, i += 1, r = A(e, i);
  const n = t / r.rowMax, s = (0.5 + 1 / r.rowMax * Math.PI) * Math.PI, a = n * 2 * Math.PI + s;
  return { offset: r.offset, theta: a };
}
function Z(t, e, i) {
  const { offset: r, theta: n } = Q(e, i), { x: s, y: a } = J(n), l = i.gridSizeX > i.gridSizeY ? Math.abs(i.gridSizeX - i.gridSizeY) / 2 : 0, f = i.gridSizeY > i.gridSizeX ? Math.abs(i.gridSizeY - i.gridSizeX) / 2 : 0;
  t.position.x = l + (s * r + 1) / 2 * i.tokenTileFactor * i.gridSize, t.position.y = f + (-1 * a * r + 1) / 2 * i.tokenTileFactor * i.gridSize;
}
function ee(t) {
  t.effects.bg.visible = !1;
  const e = te(t);
  let i = 0;
  for (const r of t.effects.children)
    r !== t.effects.bg && r !== t.effects.overlay && r instanceof PIXI.Sprite && (r.anchor.set(0.5), K(r, e.iconRadius * 2), Z(r, i, e), i++);
}
function A(t, e) {
  const i = t.iconRadius * game.settings.get(u.id, "effect-spacing"), r = t.iconRadius * game.settings.get(u.id, "row-spacing"), n = t.tokenRadius + (2 * e - 1) * t.iconRadius + e * r, s = n * 2 / (t.gridSize * t.tokenTileFactor), a = Math.floor(Math.PI / Math.asin((t.iconRadius + i) / n));
  return { offset: s, rowMax: a };
}
function te(t) {
  const e = game.settings.get(u.id, "effect-scale"), i = t.actor ? y(t.actor, "effect-scale") ?? 1 : 1, r = t.actor ? y(t.actor, "global-effect-scale") ?? !0 : !0, n = t.scene?.grid.size ?? 100, s = t.scene?.grid.sizeX ?? 100, a = t.scene?.grid.sizeY ?? 100, l = t.document.width, c = n / 5 / 2;
  let d = n * l / 2 * t.document.texture.scaleX;
  return r && (d *= e), d *= i, t.hasDynamicRing && (d *= t.ring?.textureScaleAdjustment ?? 1, CONFIG.Token.ring.isGridFitMode || (d /= t.ring?.subjectScaleAdjustment ?? 1)), {
    gridSize: n,
    gridSizeX: s,
    gridSizeY: a,
    iconRadius: c,
    tokenRadius: d,
    tokenTileFactor: l
  };
}
function ie(t, e) {
  const i = new PIXI.Graphics(), r = t / 2;
  return i.lineStyle(e, game.settings.get(u.id, "effect-border"), 1, 0), i.beginFill(game.settings.get(u.id, "effect-background")), i.drawCircle(r, r, r), i.endFill(), i;
}
function re(t) {
  const e = t.texture, i = 3, r = g.spriteSize, n = new PIXI.Container();
  n.width = r, n.height = r, n.addChild(ie(r, i)), n.addChild(t);
  const a = (r - 6 * i) / Math.max(e.height, e.width);
  t.scale.set(a, a), t.x = (r - t.width) / 2, t.y = (r - t.height) / 2;
  const l = r / 2 - 3 * i;
  return t.mask = new PIXI.Graphics().beginFill(16777215).drawCircle(r / 2, r / 2, l).endFill(), n;
}
const ne = "pf2e-effects-halo", se = {
  id: ne
};
u.register(se.id);
const T = new g();
Hooks.once("init", () => {
  game.settings.register(u.id, "effect-background", {
    name: "Effect Background Color",
    scope: "user",
    config: !0,
    type: new foundry.data.fields.ColorField({ required: !0, initial: E.isPF2e ? "#d8c384" : "#9edae6" })
  }), game.settings.register(u.id, "effect-border", {
    name: "Effect Border Color",
    scope: "user",
    config: !0,
    type: new foundry.data.fields.ColorField({ required: !0, initial: E.isPF2e ? "#5e0000" : "#1d3c53" })
  }), game.settings.register(u.id, "effect-spacing", {
    name: "Effect Spacing",
    scope: "world",
    config: !0,
    type: new foundry.data.fields.NumberField({ required: !0, min: 0, max: 0.5, step: 0.05, initial: 0.1 })
  }), game.settings.register(u.id, "row-spacing", {
    name: "Row Spacing",
    scope: "world",
    config: !0,
    type: new foundry.data.fields.NumberField({ required: !0, min: 0, max: 0.5, step: 0.05, initial: 0.1 })
  }), game.settings.register(u.id, "effect-scale", {
    name: "Effect Scale",
    hint: "Increases the calculated radius of tokens to determine placement of effect icons.",
    scope: "world",
    config: !0,
    type: new foundry.data.fields.NumberField({ required: !0, min: 0.2, max: 3, step: 0.05, initial: 1 })
  });
});
Hooks.once("ready", () => {
  libWrapper.register(
    u.id,
    "foundry.canvas.placeables.Token.prototype._refreshEffects",
    function(t) {
      u.log(this.name, "_refreshEffects"), t(), ee(this);
    },
    "WRAPPER"
  ), libWrapper.register(
    u.id,
    "foundry.canvas.placeables.Token.prototype._drawEffect",
    async function(t, e) {
      if (u.log(this.name, "_drawEffect"), !t) return;
      const i = "icons/svg/hazard.svg", r = t || i;
      let n = T.loadTexture(r), s;
      if (n)
        s = new PIXI.Sprite(n);
      else {
        const a = await foundry.canvas.loadTexture(t, {
          fallback: i
        }), l = new PIXI.Sprite(a);
        if (t === game.settings.get(game.system.id, "deathIcon"))
          return this.effects.addChild(l);
        n = T.addToCache(r, re(l)), s = new PIXI.Sprite(n);
      }
      return this.effects.addChild(s);
    },
    "OVERRIDE"
  );
});
Hooks.on(
  "getActorSheetPF2eHeaderButtons",
  (t, e) => {
    game.user.isGM && e.unshift({
      label: "Effects Halo",
      class: u.id,
      icon: "fa-solid fa-sparkles",
      onclick: async () => {
        const i = foundry.applications.fields.createFormGroup({
          label: "Effect Scale",
          hint: "Increases the calculated radius of tokens to determine placement of effect icons.",
          input: foundry.applications.elements.HTMLRangePickerElement.create({
            name: "effect-scale",
            value: y(t.actor, "effect-scale") ?? 1,
            min: 0.2,
            max: 3,
            step: 0.05
          })
        }).outerHTML, r = foundry.applications.fields.createFormGroup({
          label: "Global Effect Scale",
          hint: "Apply the Effect Scale configured under Settings to this token.",
          input: foundry.applications.fields.createCheckboxInput({
            name: "global-effect-scale",
            value: y(t.actor, "global-effect-scale") ?? !0
          })
        }).outerHTML, n = await foundry.applications.api.DialogV2.prompt({
          window: { title: "PF2e Effect Halo" },
          position: { width: 600 },
          content: i + r,
          ok: {
            icon: "fa-solid fa-floppy-disk",
            label: game.i18n.format("DOCUMENT.Update", {
              type: game.i18n.localize(Actor.metadata.label)
            }),
            callback: (s, a) => new foundry.applications.ux.FormDataExtended(a.form).object
          }
        });
        n && await H(t.actor, n);
      }
    });
  }
);
//# sourceMappingURL=pf2e-effects-halo.js.map
