/* eslint-disable max-classes-per-file */
class Attr {
  expression: string;
  constructor(attrExpression: string) {
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

  setAttribute(el: HTMLElement) {
    if (this.isId) {
      el.setAttribute("id", this.value);
    } else if (this.isClass) {
      el.classList.add(this.value);
    } else {
      throw new Error(`neither id nor class : [${this.expression}]`);
    }
  }
}
const closest = (elem: HTMLElement, selector: string) => {
  if (elem.nodeType === 1) {
    return elem.closest(selector) as HTMLElement;
  }
  if (elem.nodeType === 3) {
    return elem.parentElement?.closest(selector) as HTMLElement;
  }
  throw new Error(`node type ${elem.nodeType}, tag(${elem.nodeName})`);
};

const parseAttr = (expression?: string) => {
  const attr = expression || "";
  return attr
    .split(" ")
    .map((val) => val.trim())
    .filter((val) => val.length > 0);
};
const createEl = <T = HTMLElement>(tagName: string, attributes?: string[]) => {
  const tag = document.createElement(tagName);
  if (attributes) {
    attributes.forEach((value) => {
      const attr = new Attr(value);
      attr.setAttribute(tag);
    });
  }
  return tag as T;
};
type TagUtil = {
  span: (attr: string, content: string) => HTMLSpanElement;
  iconButton: (attrs: string, content: string) => HTMLButtonElement;
  img: (
    imgUrl: string
  ) => Promise<{ img: HTMLImageElement; width: number; height: number }>;
  div: (attr?: string) => HTMLDivElement;
  style: (attr?: string) => HTMLStyleElement;
  canvas: (attr?: string) => HTMLCanvasElement;
};
const tag: TagUtil = {
  span: (attr: string, content: string) => {
    const span = createEl("span", parseAttr(attr));
    if (content) {
      span.innerHTML = content;
    }
    return span;
  },
  iconButton: (attrs: string, content: string) => {
    const button = createEl<HTMLButtonElement>("BUTTON", parseAttr(attrs));
    button.innerHTML = content;
    return button;
  },
  img: (
    imgUrl: string
  ): Promise<{ img: HTMLImageElement; width: number; height: number }> => {
    const img = createEl<HTMLImageElement>("img");
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
  div: (attr?: string) => createEl<HTMLDivElement>("DIV", parseAttr(attr)),
  style: (attr?: string) =>
    createEl<HTMLStyleElement>("STYLE", parseAttr(attr)),
  canvas: (attr?: string) =>
    createEl("CANVAS", parseAttr(attr)) as HTMLCanvasElement,
};

const attr = (
  el: HTMLElement,
  attrName: string,
  attrValue: string,
  always?: boolean
) => {
  const v = el.getAttribute(attrName);
  if (always || !v) {
    el.setAttribute(attrName, attrValue);
  }
};
type ClassUtil = {
  add: (el: HTMLElement, className: string) => void;
  remove: (el: HTMLElement, className: string) => void;
};
const clazz: ClassUtil = {
  add: (el: HTMLElement, className: string) => el.classList.add(className),
  remove: (el: HTMLElement, className: string) =>
    el.classList.remove(className),
};
// const imageSize = (imgUrl: string) => {
//   const xhr = new XMLHttpRequest();
//   xhr.open("HEAD", imgUrl, true);
//   xhr.onreadystatechange = () => {
//     if (xhr.readyState === xhr.DONE) {
//       console.log(xhr.getResponseHeader("Content-Length"));
//     }
//   };
//   xhr.send();
// };

// const fileToImage = (file: Blob) => {
//   const reader = new FileReader();
//   return new Promise((resolve) => {
//     reader.addEventListener("load", () => {
//       const img = document.createElement("img");
//       img.src = "" + reader.result;
//       resolve({ file, img });
//     });
//     reader.readAsDataURL(file);
//   });
// };

const registerEvent = (
  target: HTMLElement,
  eventName: string,
  callback: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions | undefined
) => {
  const el = target || globalThis;
  el.addEventListener(eventName, callback, options || false);
};

const registerKeyEvent = (
  target: HTMLElement,
  eventName: string,
  callback: EventListener,
  options?: any
) => {
  target.addEventListener(
    eventName,
    (e: Event) => {
      const code = (e as KeyboardEvent).code.toLowerCase();
      const { keys } = options;
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const { ctrlKey, shiftKey, altKey, metaKey } = e as KeyboardEvent;
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
    },
    false
  );
};
/**
 * 'enter'
 * 'space'
 * 'ctrl@enter'
 * 'alt+shift@space'
 * @param {string} keyFormat
 */
const parseKeyOption = (keyFormat: string) => {
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
  int: (el: HTMLElement, attrList: string[]) => {
    const d: any = {};
    attrList.forEach((key) => {
      const v = el.dataset[key] || "";
      d[key] = parseInt(v, 10);
    });
    return d;
  },
};
const stopPropagation = (e: Event) => e.stopPropagation();

type EventUtil = {
  consume: (target: HTMLElement, eventName: string) => void;
  click: (
    target: HTMLElement,
    callback: (e: Event) => void,
    options?: string
  ) => void;
  keydown: (
    target: HTMLElement,
    callback: (e: Event) => void,
    options: string
  ) => void;
  keyup: (
    target: HTMLElement,
    callback: (e: Event) => void,
    options?: string
  ) => void;
  input: (
    target: HTMLElement,
    callback: (e: Event) => void,
    option?: { debouce: number }
  ) => void;
  change: (target: HTMLElement, callback: (e: Event) => void) => void;
};
const event: EventUtil = {
  consume: (target: HTMLElement, eventName: string) => {
    target.addEventListener(eventName, stopPropagation);
  },
  /*
  focus: (target: HTMLElement, callback: (e: Event) => void, options: string) =>
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
  */
  click: (
    target: HTMLElement,
    callback: (e: Event) => void,
    options?: string
  ) => {
    registerEvent(target, "click", callback, undefined);
  },
  keydown: (
    target: HTMLElement,
    callback: (e: Event) => void,
    options: string
  ) => {
    options = options || "*";
    const keys = options
      .split(" ")
      .filter((key) => key.trim().length > 0)
      .map((key) => parseKeyOption(key));
    registerKeyEvent(target, "keydown", callback, { keys });
  },
  keyup: (
    target: HTMLElement,
    callback: (e: Event) => void,
    options?: string
  ) => {
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
  input: (
    target: HTMLElement,
    callback: (e: Event) => void,
    option?: { debouce: number }
  ) => {
    if (option?.debouce > 0) {
      let timer: NodeJS.Timeout;
      registerEvent(
        target,
        "input",
        (e) => {
          clearTimeout(timer);
          timer = setTimeout(callback, option.debouce, e);
        },
        undefined
      );
    } else {
      registerEvent(target, "input", callback, undefined);
    }
  },
  change: (target: HTMLElement, callback: (e: Event) => void) => {
    registerEvent(target, "change", callback, undefined);
  },
};

const converters = {
  width: (val: number | string): string => {
    const type = typeof val;
    return type === "number" ? `${val}px` : "" + val;
  },
};
"top,left,height,minWidth,minHeight".split(",").forEach((prop: string) => {
  converters[prop] = converters.width;
});

const css = (el: HTMLElement, styles: any) => {
  Object.keys(styles).forEach((key: any) => {
    const fn = converters[key] || ((val: string) => val);
    const value: string = fn(styles[key]);
    el.style[key] = value;
  });
};
const parseTemplate = <T = HTMLElement>(
  template: string,
  /** FIXME  param type*/ params?: any
) => {
  let t = template;
  Object.keys(params || {}).forEach((key) => {
    const text = "@" + key;
    const value = params[key];
    t = t.replaceAll(text, value);
  });
  const virtualElem = document.createElement("template");
  virtualElem.innerHTML = t;
  return virtualElem.content.firstElementChild as T;
  // return virtualDiv.firstElementChild;
};
const findOne = <T = HTMLElement>(el: HTMLElement, cssSelector: string) =>
  el.querySelector<HTMLElement>(cssSelector) as T;
const findAll = <T extends HTMLElement>(el: HTMLElement, selectors: string[]) =>
  selectors.reduce((holder, cssSelector) => {
    const elems = el.querySelectorAll<T>(cssSelector);
    elems.forEach((elem) => {
      holder.push(elem);
    });
    return holder;
  }, [] as T[]);
const is = (
  el: HTMLElement,
  cssSelector: string,
  searchParent: boolean = true
) => {
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
const domRect = (el: HTMLElement) => el.getBoundingClientRect();

const types = {
  method: (obj: any) => typeof obj === "function",
};
type ValidUtil = {
  path: (value: string) => Promise<string>;
  number: (value: string) => Promise<number>;
  string: (value: any) => boolean;
};
const valid: ValidUtil = {
  path: (value: string) =>
    new Promise<string>((yes, no) => {
      const v = value && value.trim();
      if (v.length > 0) {
        yes(v);
      } else {
        no(value);
      }
    }),
  number: (value: string) =>
    new Promise<number>((yes, no) => {
      const n = Number.parseFloat(value);
      if (Number.isNaN(n)) {
        no(value);
      } else {
        yes(n);
      }
    }),
  string: (value: any) => typeof value === "string" && value.trim().length > 0,
};
export class DomUtil {
  tag: TagUtil;
  attr: (
    el: HTMLElement,
    attrName: string,
    attrValue: string,
    always?: boolean
  ) => void;
  clazz: ClassUtil;
  closest: (elem: HTMLElement, selector: string) => HTMLElement;
  event: EventUtil;
  css: (el: HTMLElement, styles: any) => void;
  parseTemplate: <T = HTMLElement>(template: string, params?: any) => T;
  findOne: <T = HTMLElement>(el: HTMLElement, cssSelector: string) => T;
  findAll: <T extends HTMLElement>(el: HTMLElement, selectors: string[]) => T[];
  is: (el: HTMLElement, cssSelector: string, searchParent?: boolean) => boolean;
  data: {
    int: (el: HTMLElement, attrList: string[]) => any;
  };
  domRect: (el: HTMLElement) => DOMRect;
  types: {
    method: (obj: any) => boolean;
  };
  valid: ValidUtil;
  constructor() {
    this.tag = tag;
    this.attr = attr;
    this.clazz = clazz;
    this.closest = closest;
    this.event = event;
    this.css = css;
    this.parseTemplate = parseTemplate;
    this.findOne = findOne;
    this.findAll = findAll;
    this.is = is;
    this.data = data;
    this.domRect = domRect;
    this.types = types;
    this.valid = valid;
  }
}

let dom: DomUtil;

export const domUtil = () => {
  return dom;
};
