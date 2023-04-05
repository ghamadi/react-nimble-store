import { createContext, ReactNode, useRef, useCallback, useMemo } from 'react';
import { storeManager, StoreContextValue, StoreContext } from '~/lib/store-manager';

type StoreParams<T extends object> = {
  id: number;
  Context: StoreContext<T>;
  Provider: (props: { children: ReactNode }) => JSX.Element;
};

class Store<T extends object> {
  readonly id: number;
  readonly Provider: (props: { children: ReactNode }) => JSX.Element;

  constructor({ id, Provider }: StoreParams<T>) {
    this.id = id;
    this.Provider = Provider;
  }
}

/**
 * Creates a Store object for managing state in a React application.
 *
 * The returned `Store` exposes a `Provider` component — a wrapper for `Context.Provider` that's
 * setup to efficiently trigger the children's re-rendering where needed only.
 *
 * @param state - The initial state of the store.
 * @returns An object containing the context and provider for the store.
 */
export function createStore<T extends object>(state: T): Store<T> {
  const storeId = storeManager.mapSize + 1;
  const Context = createContext<StoreContextValue<T> | undefined>(undefined);
  const subscribers = new Set<() => void>([]);

  const Provider = (props: { children: ReactNode }) => {
    // register the context when the provider runs
    storeManager.registerContext(storeId, Context as StoreContext);

    const stateRef = useRef(state);

    const getState = useCallback(() => {
      return stateRef.current;
    }, []);

    const updateState = useCallback((value: Partial<T>) => {
      stateRef.current = { ...stateRef.current, ...value } as T;
      subscribers.forEach((callback) => callback());
    }, []);

    const subscribe = useCallback((callback: () => void) => {
      subscribers.add(callback);
      return () => subscribers.delete(callback);
    }, []);

    const contextValue = useMemo(() => {
      return {
        getState,
        updateState,
        subscribe
      };
    }, [getState, subscribe, updateState]);

    return <Context.Provider value={contextValue}>{props.children}</Context.Provider>;
  };

  return new Store({ id: storeId, Context, Provider });
}

export type { Store };
