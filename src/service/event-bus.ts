import { EVENT, MindWiredEvent } from "../mindwired-event";

const parseEvent = <T extends MindWiredEvent<any>>(eventName: string): T => {
  const pathes = eventName.toUpperCase().split(".");
  let obj: any = EVENT;
  for (let i = 0; i < pathes.length; i++) {
    obj = obj[pathes[i]];
    if (!obj) {
      throw new Error(`invalid event name: [${eventName}]`);
    }
  }
  if (obj.name !== eventName) {
    throw new Error(`event name mismatch: [${eventName}]`);
  }
  return obj as T;
};
class EventBus {
  callbacks: Map<string, Function[]>;
  constructor() {
    this.callbacks = new Map();
  }
  on<A = any>(event: MindWiredEvent<A>, callback: (arg: A) => void) {
    let callbackList = this.callbacks.get(event.name);
    if (!callbackList) {
      callbackList = [];
      this.callbacks.set(event.name, callbackList);
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
   * @param {MindWiredEvent} eventName like "valid.event.path" format
   * @param {function} callback
   */
  listen<A = any>(event: MindWiredEvent<A>, callback: (arg: A) => void) {
    // const event = parseEvent(eventName.name);
    this.on(event, callback);
  }
  emit<A = any>(event: MindWiredEvent<A>, payload: A) {
    const callbackList = this.callbacks.get(event.name) || [];
    callbackList.forEach((cb) => {
      try {
        cb(payload);
      } catch (e) {
        console.log(e);
      }
    });
    // if (emitForClient) {
    //   self.setTimeout(() => {
    //     this.emit(event["CLIENT"], payload, false);
    //   });
    // }
  }
}

export { EventBus, EVENT, parseEvent };
