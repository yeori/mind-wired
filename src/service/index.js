import dom from "./dom";
const uuid = (len) => {
  len = len || 16;
  let id = "";
  while (id.length < len) {
    id += Math.random().toString(36).substring(2);
  }
  return id.substring(0, len);
};
export { dom, uuid };
export default {
  dom,
  uuid,
};
