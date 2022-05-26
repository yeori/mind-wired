const EVENT = {
  DRAG: {
    VIEWPORT: { name: "viewport dragged", desc: "" },
    NODE: { name: "node dragged", desc: "" },
  },
  SELECTION: {
    NODE: {
      name: "node selected",
      desc: "",
    },
  },
  EDIT: {
    NODE: {
      name: "editing state of a node",
      desc: "",
    },
  },
  NODE: {
    CREATED: {
      name: "node.created",
      desc: "",
    },
    DELETED: {
      name: "node.deleted",
      desc: "node has been deleted",
    },
    UPDATED: {
      name: "node.updated",
      desc: "content of node updated",
    },
    EDITING: {
      name: "node.editing",
      desc: "node's editing state",
    },
    FOLDED: {
      name: "node.folded",
      desc: "node is folded or unfolded",
    },
  },
  VIEWPORT: {
    RESIZED: {
      name: "viewport.resized",
      desc: "viewport size chaged",
    },
    CLICKED: {
      name: "viewport.clicked",
      desc: "viewport has been clicked",
    },
  },
};
const parseEvent = (eventName) => {
  const pathes = eventName.toUpperCase().split(".");
  let obj = EVENT;
  for (let i = 0; i < pathes.length; i++) {
    obj = obj[pathes[i]];
    if (!obj) {
      throw new Error(`invalid event name: [${eventName}]`);
    }
  }
  if (obj.name !== eventName) {
    throw new Error(`event name mismatch: [${eventName}]`);
  }
  return obj;
};
const EMPTY_SET = new Set();
class EventBus {
  constructor() {
    this.callbacks = new Map();
  }

  on(eventName, callback) {
    let callbackList = this.callbacks.get(eventName);
    if (!callbackList) {
      callbackList = new Set();
      this.callbacks.set(eventName, callbackList);
    }
    callbackList.add(callback);
  }
  off(eventObj, callback) {
    const callbackList = this.callbacks.get(eventObj);
    if (!callbackList) {
      return;
    }
    const idx = callbackList.findIndex((cb) => cb === callback);
    callbackList.splice(idx, 1);
  }
  /**
   * used to register client-side callback
   * @param {string} eventName like "valid.event.path" format
   * @param {function} callback
   */
  listen(eventName, callback) {
    const event = parseEvent(eventName);
    this.on(event, callback);
  }
  emit(eventName, payload) {
    const callbackList = this.callbacks.get(eventName) || EMPTY_SET;
    callbackList.forEach((cb) => {
      try {
        cb(payload);
      } catch (e) {
        console.log(e);
      }
    });
  }
}

export { EventBus, EVENT };
