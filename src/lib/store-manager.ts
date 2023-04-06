import { Context as ReactContext } from 'react';
type Exactly<T, U> = T & Record<Exclude<keyof U, keyof T>, T[keyof T]>;

export type StoreContextValue<T extends object> = {
  getState(): T;
  updateState<E extends Exactly<Partial<T>, E>>(value: E): void;
  subscribe(callback: () => void): () => void;
};

export type StoreContext<T extends object = object> = ReactContext<
  StoreContextValue<T> | undefined
>;

class StoreManager {
  private lastId: number | null = null;
  readonly contextsMap: Record<number, StoreContext> = {};

  get mapSize() {
    return Object.keys(this.contextsMap).length;
  }

  get lastContext() {
    return this.lastId && this.contextsMap[this.lastId];
  }

  registerContext(id: number, context: StoreContext) {
    if (!this.contextsMap[id]) {
      this.contextsMap[id] = context;
      this.lastId = id;
    }
  }
}

/**
 * The singleton StoreManager instance to track all stores created
 *
 * The main purpose of the `storeManager` is to enable mapping Store instances
 * to the corresponding React Context created by `createStore` without
 * exposing the context instance itself to the using code
 */
export const storeManager = new StoreManager();
