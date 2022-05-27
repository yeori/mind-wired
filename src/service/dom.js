/* eslint-disable max-classes-per-file */
class Attr {
  constructor(attrExpression) {
    this.expression = attrExpression;
  }

  get isClass() {
    return this.expression.charAt(0) === ".";
  }

  get isId() {
    return this.expression.charAt(0) === "#";
  }

  get value() {
    return this.expression.substring(1);
  }

  setAttribute(el) {
    if (this.isId) {
      el.setAttribute("id", this.value);
    } else if (this.isClass) {
      el.classList.add(this.value);
    } else {
      throw new Error(`neither id nor class : [${this.expression}]`);
    }
  }
}
const closest = (elem, selector) => {
  if (elem.nodeType === 1) {
    return elem.closest(selector);
  }
  if (elem.nodeType === 3) {
    return elem.parentElement.closest(selector);
  }
  throw new Error(`node type ${elem.nodeTye}, tag(${elem.nodeName})`);
};

const parseAttr = (expression) => {
  const attr = expression || "";
  return attr
    .split(" ")
    .map((val) => val.trim())
    .filter((val) => val.length > 0);
};
const createEl = (tagName, attributes) => {
  const tag = document.createElement(tagName);
  attributes.forEach((value) => {
    const attr = new Attr(value);
    attr.setAttribute(tag);
  });
  return tag;
};
const tag = {
  span: (attr, content) => {
    const span = createEl("span", parseAttr(attr));
    if (content) {
      span.innerHTML = content;
    }
    return span;
  },
  iconButton: (attrs, content) => {
    const button = createEl("BUTTON", parseAttr(attrs));
    button.innerHTML = content;
    return button;
  },
  img: (imgUrl) => {
    const img = document.createElement("img");
    return new Promise((resolve, reject) => {
      img.onload = () => {
        resolve({ img, width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => {
        console.log("ERROR");
        reject("NOT_ALLOWED");
      };
      img.crossOrigin = "Anonymous";
      img.src = imgUrl;
    });
  },
  div: (attr) => createEl("DIV", parseAttr(attr)),
  canvas: (attr) => createEl("CANVAS", parseAttr(attr)),
};
const attr = (el, attrName, attrValue, always) => {
  const v = el.getAttribute(attrName);
  if (always || !v) {
    el.setAttribute(attrName, attrValue);
  }
};
const clazz = {
  add: (el, className) => el.classList.add(className),
  remove: (el, className) => el.classList.remove(className),
};
const imageSize = (imgUrl) => {
  const xhr = new XMLHttpRequest();
  xhr.open("HEAD", imgUrl, true);
  xhr.onreadystatechange = () => {
    if (xhr.readyState === xhr.DONE) {
      console.log(xhr.getResponseHeader("Content-Length"));
    }
  };
  xhr.send();
};

const fileToImage = (file) => {
  const reader = new FileReader();
  return new Promise((resolve) => {
    reader.addEventListener("load", () => {
      const img = document.createElement("img");
      img.src = reader.result;
      resolve({ file, img });
    });
    reader.readAsDataURL(file);
  });
};

const registerEvent = (target, eventName, callback, options) => {
  const el = target || window;
  el.addEventListener(eventName, callback, options || false);
};

const registerKeyEvent = (target, eventName, callback, option) => {
  target.addEventListener(eventName, (e) => {
    const code = e.code.toLowerCase();
    const { keys } = option;
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const { ctrlKey, shiftKey, altKey, metaKey } = e;
      if (
        key.code === "*" ||
        (key.code === code &&
          key.alt === altKey &&
          key.meta === metaKey &&
          key.shift === shiftKey &&
          key.ctrl === ctrlKey)
      ) {
        callback(e);
        break;
      }
    }
  });
};
/**
 * 'enter'
 * 'space'
 * 'ctrl@enter'
 * 'alt+shift@space'
 * @param {string} keyFormat
 */
const parseKeyOption = (keyFormat) => {
  let [metaKeys, code] = keyFormat.split("@");
  if (!code) {
    // 'enter', 'space'
    code = metaKeys;
    metaKeys = "";
  }
  const metas = metaKeys.split("+");
  return {
    ctrl: metas.includes("ctrl"),
    shift: metas.includes("shift"),
    alt: metas.includes("alt"),
    meta: metas.includes("meta"),
    code,
  };
};
const data = {
  int: (el, attrList) => {
    const d = {};
    attrList.forEach((key) => {
      const v = el.dataset[key];
      d[key] = parseInt(v, 10);
    });
    return d;
  },
};
const stopPropagation = (e) => e.stopPropagation();
const event = {
  createEventBus: () => new EventBus(),
  consume: (target, eventName) => {
    target.addEventListener(eventName, stopPropagation);
  },
  focus: (target, callback, options) =>
    registerEvent(target, "focus", callback, options),
  mousedown: (callback, target, options) => {
    registerEvent(target, "mousedown", callback, options);
  },
  mousemove: (callback, target, options) => {
    registerEvent(target, "mousemove", callback, options);
  },
  mouseup: (callback, target, options) => {
    registerEvent(target, "mouseup", callback, options);
  },
  touchstart: (callback, target, options) => {
    registerEvent(target, "touchstart", callback, options);
  },
  touchmove: (callback, target, options) => {
    registerEvent(target, "touchmove", callback, options);
  },
  touchend: (callback, target, options) => {
    registerEvent(target, "touchend", callback, options);
  },
  click: (target, callback, options) => {
    registerEvent(target, "click", callback, options);
  },
  keydown: (target, callback, options) => {
    options = options || "*";
    const keys = options
      .split(" ")
      .filter((key) => key.trim().length > 0)
      .map((key) => parseKeyOption(key));
    registerKeyEvent(target, "keydown", callback, { keys });
  },
  keyup: (target, callback, options) => {
    options = options || "*";
    const keys = options
      .split(" ")
      .filter((key) => key.trim().length > 0)
      .map((key) => parseKeyOption(key));
    registerKeyEvent(target, "keyup", callback, {
      keys,
    });
    // registerEvent(target, "keyup", callback, options);
  },
  resize: (target, callback) => {},
};
const converters = {
  width: (val) => {
    const type = typeof val;
    return type === "number" ? `${val}px` : val;
  },
};
"top,left,height,minWidth,minHeight".split(",").forEach((prop) => {
  converters[prop] = converters.width;
});

const css = (el, styles) => {
  Object.keys(styles).forEach((key) => {
    const fn = converters[key] || ((val) => val);
    const value = fn(styles[key]);
    el.style[key] = value;
  });
};
const parseTemplate = (template, params) => {
  let t = template;
  Object.keys(params || {}).forEach((key) => {
    const text = "@" + key;
    const value = params[key];
    t = t.replaceAll(text, value);
  });
  const virtualElem = document.createElement("template");
  virtualElem.innerHTML = t;
  return virtualElem.content.firstElementChild;
  // return virtualDiv.firstElementChild;
};
const findOne = (el, cssSelector) => el.querySelector(cssSelector);
const is = (el, cssSelector, searchParent = true) => {
  const found = el.matches(cssSelector);
  if (found) {
    return found;
  }
  if (searchParent) {
    const elem = closest(el, cssSelector);
    return !!elem;
  } else {
    return false;
  }
};
const domRect = (el) => el.getBoundingClientRect();

const types = {
  method: (obj) => typeof obj === "function",
};
const valid = {
  path: (value) =>
    new Promise((yes, no) => {
      const v = value && value.trim();
      if (v.length > 0) {
        yes(v);
      } else {
        no(value);
      }
    }),
  number: (value) =>
    new Promise((yes, no) => {
      const n = parseFloat(value);
      if (Number.isNaN(n)) {
        no(value);
      } else {
        yes(n);
      }
    }),
  string: (value) => typeof value === "string" && value.trim().length > 0,
};
export default {
  tag,
  attr,
  clazz,
  closest,
  imageSize,
  fileToImage,
  event,
  css,
  parseTemplate,
  findOne,
  is,
  data,
  domRect,
  types,
  valid,
};
