import { dom } from "../service";
import { EventBus } from "../service/event-bus";

const DEFAULT_UI_CONFIG = {
  width: 600,
  height: 600,
  scale: 1.0,
  clazz: {
    node: "active-node",
    edge: "active-edge",
    level: (level) => `level-${level}`,
  },
  offset: { x: 0, y: 0 },
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
  emit(eventName, args) {
    this.ebus.emit(eventName, args);
    return this;
  }
}

Configuration.parse = (config) => {
  const cssSelector = config.el;
  const ui = Object.assign({}, DEFAULT_UI_CONFIG, config.ui);

  const el = document.querySelector(cssSelector);
  return new Configuration({ el, ui });
};
export default Configuration;
