import { dom, clone } from "../service";
import { EventBus } from "../service/event-bus";

const DEFAULT_UI_CONFIG = {
  width: 600,
  height: 600,
  scale: 1.0,
  clazz: {
    node: "active-node",
    edge: "active-edge",
    schema: (schemaName) => schemaName,
    level: (level) => `level-${level}`,
  },
  offset: { x: 0, y: 0 },
  snap: {
    limit: 4,
    width: 0.4,
    dash: [6, 2],
    color: { horizontal: "orange", vertical: "#2bc490" },
  },
  selection: {
    padding: 5,
    "background-color": "#b3ddff6b",
    "border-radius": "4px",
  },
};
class Configuration {
  constructor({ el, ui }) {
    this.el = el;
    this.ui = ui;
    this.ebus = new EventBus();
  }
  get width() {
    return this.ui.width;
  }
  get height() {
    return this.ui.height;
  }
  get scale() {
    return this.ui.scale;
  }
  get snapEnabled() {
    return this.ui.snap.enabled;
  }
  getOffset() {
    const offset = this.ui.offset;
    return { ...offset };
  }
  setOffset(offset) {
    this.ui.offset = { ...offset };
  }
  relativeOffset(offset) {
    const baseOffset = this.ui.offset;
    return { x: baseOffset.x + offset.x, y: baseOffset.y + offset.y };
  }
  activeClassName(type) {
    const className = this.ui.clazz[type];
    if (!className) {
      throw new Error(`[MINDWIRED][ERROR] no classname of type : "${type}"`);
    }
    return className;
  }
  nodeLevelClassName(node) {
    const method = this.ui.clazz.level;
    if (!dom.types.method(method)) {
      throw new Error(
        `clazz.level should be function, but ${typeof method}. (level, node) => {} `
      );
    }
    const className = method
      ? method(node.level(), node)
      : `level-${node.level()}`;

    return className;
  }
  listen(eventName, callback) {
    this.ebus.on(eventName, callback);
    return this;
  }
  off(eventName, callback) {
    this.ebus.off(eventName, callback);
  }
  emit(eventName, args, emitForClient) {
    this.ebus.emit(eventName, args, !!emitForClient);
    return this;
  }
}

const normalizeSnap = (ui) => {
  const { snap } = ui;
  if (snap === false) {
    ui.snap = clone.deepCopy(DEFAULT_UI_CONFIG.snap);
    ui.snap.enabled = false;
  } else {
    if (dom.valid.string(snap.color)) {
      snap.color = {
        horizontal: snap.color.trim(),
        vertical: snap.color.trim(),
      };
    }
    snap.limit = snap.limit || DEFAULT_UI_CONFIG.snap.limit;
    snap.width = snap.width || DEFAULT_UI_CONFIG.snap.width;
    if (snap.dash !== false) {
      snap.dash = snap.dash || DEFAULT_UI_CONFIG.snap.dash;
    }
    snap.enabled = true;
  }
};
Configuration.parse = (config) => {
  const cssSelector = config.el;
  const ui = clone.mergeLeaf(
    config.ui || {},
    clone.deepCopy(DEFAULT_UI_CONFIG)
  );

  normalizeSnap(ui);

  const el =
    typeof config.el === "string"
      ? document.querySelector(config.el)
      : config.el;
  return new Configuration({ el, ui });
};
export default Configuration;
