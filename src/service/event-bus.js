const EVENT = {
  DRAG: {
    VIEWPORT: { name: "viewport dragged", desc: "" },
    NODE: { name: "node dragged", desc: "" },
  },
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
