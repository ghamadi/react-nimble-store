import { Store } from '~/lib/models/store';
import { SelectorOptions, StoreContext } from '~/lib/types';
import { storeManager } from '~/lib/models/store-manager';
import { useContext, useState, useEffect, useCallback } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Actions = Record<string, (...args: any) => void>;

/**
 * A hook that returns a given store's state.
 *
 * @param store - The store from which the state will be fetched
 * @param options - Options for fine-tuning the hook's output.
 * -If a selector is passed, the hook returns the output of the selector.
 * -If a predicate is passed, the hook relies on it to decide equality and trigger state change
 *
 * @returns - selected state
 */
export function useStore<T, E>(store: Store<T>, options?: SelectorOptions<T, E>) {
  const { predicate, selector: defaultSelector } = options ?? {};

  // Defaults to the entire state if defaultSelector is undefined
  const selector = useCallback(
    (state: T) => (defaultSelector ? defaultSelector(state) : (state as unknown as E)),
    [defaultSelector]
  );

  // Defaults to === if predicate is undefined.
  const areEqual = useCallback(
    (arg1: E, arg2: E) => (predicate ? predicate(arg1, arg2) : arg1 === arg2),
    [predicate]
  );

  const storeContextValue = useContextValue(store, 'useStore');
  const { getState, subscribe } = storeContextValue;
  const [selectedState, setSelectedState] = useState(selector(getState()));

  useEffect(() => {
    return subscribe(() => {
      const newValue = selector(getState());
      if (!areEqual(newValue, selectedState)) {
        setSelectedState(newValue);
      }
    });
  }, [selector, getState, subscribe, areEqual, selectedState]);

  return selectedState as E extends infer E ? E : T;
}

/**
 * TODO: Improve the typing for the returned actions. I need a way to have the action
 * properties inferred by TS based on the passed Store (without needing the explicit generic A)
 * This will probably require refactoring the types starting at `createStore`
 *
 * A hook that returns the dispatch function of a store.
 *
 * @param store - The store whose actions are needed
 * @returns An object of functions that update the store's
 */
export function useActions<A extends Actions, T = object>(store: Store<T>) {
  const storeContextValue = useContextValue(store, 'useActions');

  return storeContextValue.getActions() as A;
}

/**
 * Internal helper used to validate a given store and return its context value
 *
 * @param store - The Store with which the returned context is registered
 * @param hookName - The name of the hook calling this function
 * @returns storeContextValue of the passed store
 * @throws - an error if the Store does not have a context or a contextValue associated with it
 */
function useContextValue<T>(store: Store<T>, hookName: string) {
  const storeContext = storeManager.contextsMap[store.id] as StoreContext<T>;

  if (!storeContext) {
    // If Store.Provider was not used at all (context was never registered)
    throw new Error(`${hookName} must be used within a Store.Provider`);
  }

  const storeContextValue = useContext(storeContext);
  if (!storeContextValue) {
    // If Store.Provider was used, but the hook is called from a sibling/parent component
    throw new Error(`${hookName} must be used within a Store.Provider`);
  }

  return storeContextValue;
}
