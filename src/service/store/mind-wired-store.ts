import { type Subscriber, type Writable } from "svelte/store";
const dummy: () => void = () => {};
const updateStore = <T>(store: Writable<T>, callback: (state: T) => void) => {
  store.update((state) => {
    callback(state);
    return state;
  });
};

export abstract class MindWiredStore<T> {
  protected abstract store: Writable<T>;
  constructor() {}
  subscribe(callback: Subscriber<T>) {
    return this.store.subscribe(callback);
  }
  update(callback?: (state: T) => void) {
    updateStore(this.store, callback || dummy);
  }
}
