import { EventBus } from "../service/event-bus";

const DEFAULT_UI_CONFIG = {
  width: 600,
  height: 600,
  scale: 1.0,
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
  listen(eventName, callback) {
    this.ebus.on(eventName, callback);
  }
  emit(eventName, args) {
    this.ebus.emit(eventName, args);
  }
}

Configuration.parse = (config) => {
  const cssSelector = config.el;
  const ui = config.ui || DEFAULT_UI_CONFIG;

  const el = document.querySelector(cssSelector);
  return new Configuration({ el, ui });
};
export default Configuration;
