import PlainTextRenderer from "./renderer/plain-text-renderer";
import IconBadgeRenderer from "./renderer/icon-badge-renderer";
import ThumbnailRenderer from "./renderer/thumbnail-renderer";
import NodeRenderingContext from "./node-rendering-context";
import LinkRenderer from "./renderer/link-renderer";

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
  const thumnailRenderer = new ThumbnailRenderer(ctx);
  ctx.register(thumnailRenderer);
  const linkRenderer = new LinkRenderer(ctx);
  ctx.register(linkRenderer);
  return ctx;
};
export default {
  install,
  getRenderer,
};
