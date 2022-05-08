const DEFAULT_UI_CONFIG = {
  width: 600,
  height: 600,
};
class Configuration {
  constructor({ el, ui }) {
    this.el = el;
    this.ui = ui;
  }
  get width() {
    return this.ui.width;
  }
  get height() {
    return this.ui.height;
  }
}

Configuration.parse = (config) => {
  const cssSelector = config.el;
  const ui = config.ui || DEFAULT_UI_CONFIG;

  const el = document.querySelector(cssSelector);
  return new Configuration({ el, ui });
};
export default Configuration;
