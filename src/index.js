import { dom } from "./service";
import { MindWired } from "./components/mind-wired";
import Configuration from "./components/config";

const injectCanvas = (el) => {
  const canvas = dom.tag.canvas();
  el.append(canvas);
};
const autoInstallation = () => {
  const el = document.querySelector("[mind-wired-holder]");
  // el.innerHTML = `<canvas width="400" height="400"></canvas>`;
  if (el) {
    let canvasEl = dom.findOne(el, "canvas");
    if (!canvasEl) {
      canvasEl = injectCanvas(el);
    }
  }
};

window.addEventListener("DOMContentLoaded", (event) => {
  autoInstallation();
});

const init = (config) => {
  const { el } = config;
  return new Promise((success, failure) => {
    if (el) {
      const configObj = Configuration.parse(config);
      const mrd = new MindWired(configObj);
      success(mrd);
    } else {
      failure({ cause: "no_css_selector" });
    }
  });
};
export { init };
