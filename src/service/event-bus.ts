const EVENT: any = {
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
  NODE: {
    CREATED: {
      name: "node.created",
      desc: "new node created",
      CLIENT: {
        name: "node.created.client",
        desc: "client-side node creation event",
      },
    },
    DELETED: {
      name: "node.deleted",
      desc: "node has been deleted",
      CLIENT: {
        name: "node.deleted.client",
        desc: "client-side node deletion event",
      },
    },
    UPDATED: {
      name: "node.updated",
      desc: "content of node updated",
      CLIENT: {
        name: "node.updated.client",
        desc: "client-side node update event",
      },
    },
    SELECTED: {
      name: "node.selected",
      desc: "one or more nodes selected",
      CLIENT: {
        name: "node.selected.client",
        desc: "client-side node selection event",
      },
    },
    CLICKED: {
      name: "node.clicked",
      desc: "a node clicked(without dragging)",
      CLIENT: {
        name: "node.clicked.client",
        desc: "client-side node click event",
      },
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
const parseEvent = (eventName: string) => {
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
class EventBus {
  callbacks: Map<string, Function[]>;
  constructor() {
    this.callbacks = new Map();
  }
  on(eventName: string, callback: Function) {
    let callbackList = this.callbacks.get(eventName);
    if (!callbackList) {
      callbackList = [];
      this.callbacks.set(eventName, callbackList);
    }
    callbackList.push(callback);
  }
  off(eventObj: string, callback: Function) {
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
  listen(eventName: string, callback: Function) {
    const event = parseEvent(eventName);
    this.on(event, callback);
  }
  emit(eventName: string, payload: any, emitForClient: boolean | undefined) {
    const callbackList = this.callbacks.get(eventName) || [];
    callbackList.forEach((cb) => {
      try {
        cb(payload);
      } catch (e) {
        console.log(e);
      }
    });
    if (emitForClient) {
      window.setTimeout(() => {
        this.emit(eventName["CLIENT"], payload, false);
      });
    }
  }
}

export { EventBus, EVENT };
