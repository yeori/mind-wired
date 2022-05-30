import dom from "./dom";
import clone from "./clone";
const uuid = (len) => {
  len = len || 16;
  let id = "";
  while (id.length < len) {
    id += Math.random().toString(36).substring(2);
  }
  return id.substring(0, len);
};
export { dom, clone, uuid };
export default {
  dom,
  clone,
  uuid,
};
