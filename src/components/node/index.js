import PlainTextRenderer from "./renderer/plain-text-renderer";
import IconBadgeRenderer from "./renderer/icon-badge-renderer";
import NodeRenderingContext from "./node-rendering-context";

const createRenderingContext = (canvasUI) => new NodeRenderingContext(canvasUI);

const getRenderer = (type) => {
  return renderings.get(type);
};

const install = (canvasUI) => {
  const ctx = createRenderingContext(canvasUI);
  const plainTextRenderer = new PlainTextRenderer(ctx);
  ctx.register(plainTextRenderer);
  const iconBadgeRenderer = new IconBadgeRenderer(ctx);
  ctx.register(iconBadgeRenderer);
  return ctx;
};
export default {
  install,
  getRenderer,
};
