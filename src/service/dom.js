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
const attr = (el, attrName, attrValue) => {
  const v = el.getAttribute(attrName);
  if (!v) {
    el.setAttribute(attrName, attrValue);
  }
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
  el.addEventListener(eventName, callback, options);
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
};
const css = (el, styles) => {
  const converters = {
    width: (val) => {
      const type = typeof val;
      return type === "number" ? `${val}px` : val;
    },
  };
  converters.top = converters.left = converters.height = converters.width;

  Object.keys(styles).forEach((key) => {
    const fn = converters[key] || ((val) => val);
    const value = fn(styles[key]);
    // eslint-disable-next-line no-param-reassign
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
const is = (el, cssSelector, callback) => {
  const found = el.matches(cssSelector);
  if (found) {
    callback(el);
    return found;
  }
  const elem = closest(el, cssSelector);
  if (elem) {
    callback(elem);
    return true;
  }
  return false;
};
export default {
  tag,
  attr,
  closest,
  imageSize,
  fileToImage,
  event,
  css,
  parseTemplate,
  findOne,
  is,
  data,
};
