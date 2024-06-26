import { MindWired } from "./components/mind-wired";
import { Configuration } from "./components/config";
import "./assets/mind-wired.scss";
import "./assets/extra/mind-wired-editor.scss";
import { InitParam } from "./setting";
import { DomUtil } from "./service/dom";

export * from "./service";
export * from "./mindwired-event";
export * from "./setting";
export * from "./components";

const injectCanvas = (el: HTMLElement, dom: DomUtil) => {
  const canvas = dom.tag.canvas();
  el.append(canvas);
  return canvas;
};
const autoInstallation = (dom: DomUtil) => {
  const el = document.querySelector("[mind-wired-holder]") as HTMLElement;
  if (el) {
    let canvasEl = dom.findOne(el, "canvas") as HTMLCanvasElement;
    if (!canvasEl) {
      injectCanvas(el, dom);
    }
  }
};

const init = (param: InitParam) => {
  return new Promise<MindWired>((success, failure) => {
    const dom = new DomUtil();
    const { el } = param;
    if (el) {
      window.addEventListener("DOMContentLoaded", () => {
        autoInstallation(dom);
      });
      const configObj = Configuration.parse(param, dom);
      configObj.dom = dom;
      const mrd = new MindWired(configObj);
      if (param.schema) {
        const ctx = mrd.getSchemaContext();
        param.schema.forEach((schema) => {
          ctx.addSchema(schema, { skipEvent: true });
        });
      }
      success(mrd);
    } else {
      failure({ cause: "no_css_selector" });
    }
  });
};

const initMindWired = init;

export { init, initMindWired };
