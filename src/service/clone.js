const isPrimitive = (o) => {
  const type = typeof o;
  if ("number,string,boolean,undefined".includes(type)) return true;
};
const isFunction = (o) => typeof o === "function";
const deepCopy = (src) => {
  if (
    src === undefined ||
    src === null ||
    isPrimitive(src) ||
    isFunction(src)
  ) {
    return src;
  }
  const dst = Array.isArray(src) ? [] : {};
  Object.keys(src).forEach((prop) => {
    const value = deepCopy(src[prop]);
    dst[prop] = value;
  });
  return dst;
};
/**
 * merge existing leaf value of src into target
 *
 *```javascript
 * src: {padding: {left: 8, right: 8}}
 * target: {color: '#aaa', padding: {top: 16} }
 *
 * merged: {color: '#aaa', padding: {top: 16, left:8, right: 8}}
 * ```
 * @param {object} src
 * @param {object} target
 */
const mergeLeaf = (src, target) => {
  Object.keys(src).forEach((prop) => {
    if (target[prop] === null || target[prop] === undefined) {
      target[prop] = deepCopy(src[prop]);
    } else if (isPrimitive(src[prop]) || isFunction(src[prop])) {
      target[prop] = src[prop];
    } else {
      mergeLeaf(src[prop], target[prop]);
    }
  });
  return target;
};
export default {
  deepCopy,
  mergeLeaf,
};
