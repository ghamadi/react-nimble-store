import { createContext, ReactNode, useRef, useCallback } from 'react';
import { Store } from '~/lib/models/store';
import { storeManager } from '~/lib/models/store-manager';
import {
  StoreContextValue,
  StoreContext,
  StateSetter,
  StateSetterArg,
  StoreActionsBuilder,
  StoreActions
} from '~/lib/types';

/**
 * Creates a Store object for managing state in a React application.
 *
 * The returned `Store` exposes a `Provider` component — a wrapper for `Context.Provider` that's
 * setup to efficiently trigger the children's re-rendering where needed only.
 *
 * @param state - The initial state of the store.
 * @returns An object containing the context and provider for the store.
 */
export function createStore<T, S extends string>(
  state: T,
  actions: StoreActionsBuilder<T, S>
): Store<T> {
  const storeId = storeManager.mapSize + 1;
  const Context = createContext<StoreContextValue<T> | undefined>(undefined);
  const subscribers = new Set<() => void>([]);

  const Provider = (props: { children: ReactNode }) => {
    // register the context when the provider runs
    storeManager.registerContext(storeId, Context as StoreContext);

    // Returns the current version of the state
    const getState = useCallback(() => {
      return stateRef.current;
    }, []);

    // Returns the current version of the actions
    const getActions = useCallback(() => {
      return actionsRef.current as StoreActions<S>;
    }, []);

    // Used by `useSelector` to pass a callback that triggers a state change in the hook
    const subscribe = useCallback((callback: () => void) => {
      subscribers.add(callback);
      return () => subscribers.delete(callback);
    }, []);

    // The callback used by `actions` to trigger a state change
    const setState: StateSetter<T> = useCallback((arg: StateSetterArg<T>) => {
      switch (typeof arg) {
        case 'function':
          stateRef.current = structuredClone(arg(stateRef.current));
          break;
        case 'object':
          stateRef.current = structuredClone({ ...stateRef.current, ...arg });
          break;
        default:
          stateRef.current = structuredClone(arg);
      }
      subscribers.forEach((callback) => callback());
    }, []);

    /*******************************
     * INITIALIZE THE CONTEXT VALUE
     *******************************/
    const stateRef = useRef(state);
    const actionsRef = useRef(actions(setState));

    const contextValue: StoreContextValue<T> = {
      getState,
      getActions,
      subscribe
    };

    return <Context.Provider value={contextValue}>{props.children}</Context.Provider>;
  };

  return new Store({ id: storeId, Context, Provider });
}
