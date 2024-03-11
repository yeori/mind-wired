const isPrimitive = (o: any): boolean => {
  const type = typeof o;
  return "number,string,boolean,undefined".includes(type);
};
const isFunction = (o: any): boolean => typeof o === "function";
/**
 * check if obj is null or undefined
 * @param obj
 * @returns
 */
const notDefined = (obj: any): boolean => obj === undefined || obj === null;
const deepCopy = (src: any) => {
  if (
    src === undefined ||
    src === null ||
    isPrimitive(src) ||
    isFunction(src)
  ) {
    return src;
  }
  const dst = Array.isArray(src) ? [] : ({} as any);
  Object.keys(src).forEach((prop) => {
    const value = deepCopy(src[prop]);
    dst[prop] = value;
  });
  return dst;
};
/**
 * merge properties of src into dst
 *
 *```javascript
 * src: {color: '#000', padding: {left: 8, right: 8}}
 * dst: {color: '#aaa', padding: {top: 16} }
 *
 * merged: {color: '#000', padding: {top: 16, left:8, right: 8}}
 * ```
 * @param {object} src
 * @param {object} dst
 */
const mergeLeaf = (src: Record<string, any>, dst: Record<string, any>) => {
  Object.keys(src).forEach((prop) => {
    if (notDefined(dst[prop])) {
      dst[prop] = deepCopy(src[prop]);
    } else if (isPrimitive(src[prop]) || isFunction(src[prop])) {
      dst[prop] = src[prop];
    } else {
      mergeLeaf(src[prop], dst[prop]);
    }
  });
  return dst;
};
export default {
  deepCopy,
  mergeLeaf,
};
