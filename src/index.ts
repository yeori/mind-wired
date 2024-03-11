import { dom } from "./service";
import { MindWired } from "./components/mind-wired";
import Configuration from "./components/config";
import "./assets/mind-wired.scss";
import "./assets/extra/mind-wired-editor.scss";
import TreeDataSource from "./components/datasource/tree-ds";
import { InitParam } from "./setting";

const injectCanvas = (el) => {
  const canvas = dom.tag.canvas();
  el.append(canvas);
  return canvas;
};
const autoInstallation = () => {
  const el = document.querySelector("[mind-wired-holder]") as HTMLElement;
  if (el) {
    let canvasEl = dom.findOne(el, "canvas") as HTMLCanvasElement;
    if (!canvasEl) {
      injectCanvas(el);
    }
  }
};

window.addEventListener("DOMContentLoaded", (event) => {
  autoInstallation();
});

const init = (param: InitParam) => {
  return new Promise<MindWired>((success, failure) => {
    const { el } = param;
    if (el) {
      const configObj = Configuration.parse(param);
      const mrd = new MindWired(configObj);
      success(mrd);
    } else {
      failure({ cause: "no_css_selector" });
    }
  });
};

const createDataSource = () => new TreeDataSource();

export { init, createDataSource, MindWired };
