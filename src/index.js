import { dom } from "./service";
import { MindWired } from "./components/mind-wired";
import Configuration from "./components/config";
import "./assets/mind-wired.scss";
import "./assets/extra/mind-wired-editor.scss";
import TreeDataSource from "./components/datasource/tree-ds";

const injectCanvas = (el) => {
  const canvas = dom.tag.canvas();
  el.append(canvas);
};
const autoInstallation = () => {
  const el = document.querySelector("[mind-wired-holder]");
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

const createDataSource = () => new TreeDataSource();

export { init, createDataSource };

export default { init, createDataSource };
