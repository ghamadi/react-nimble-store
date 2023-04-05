import { useContext, useState, useEffect } from 'react';
import { Store } from '~/lib/create-store';
import { StoreContext, storeManager } from '~/lib/store-manager';

type StateSelector<T extends object, E = unknown> = (state: T) => E;

/**
 * A hook that subscribes to changes in the closest parent store and returns a selected state value.
 * Only a change in the value selected by the `selector` function will a change in state
 *
 * @param selector - A function that selects a subset of the store state object.
 * @param store - The store on which the `selector` function is applied. If not provided, the most immediate parent store is used
 * @returns The selected state value.
 */
export function useSelector<T extends object, E = unknown>(
  selector: StateSelector<T, E>,
  store?: Store<T>
) {
  const storeContext = store
    ? (storeManager.contextsMap[store.id] as StoreContext<T>)
    : (storeManager.lastContext as StoreContext<T>);

  if (!storeContext) {
    // If Store.Provider was not used at all (context was never registered)
    throw new Error('useStore must be used within a Store.Provider');
  }

  const storeContextValue = useContext(storeContext);
  if (!storeContextValue) {
    // If Store.Provider was used, but the hook is called from a sibling/parent component
    throw new Error('useStore must be used within a Store.Provider');
  }

  const { getState, subscribe } = storeContextValue;
  const [selectedState, setSelectedState] = useState(selector(getState()));

  useEffect(() => {
    return subscribe(() => {
      setSelectedState(selector(getState()));
    });
  }, [selector, getState, subscribe]);

  return selectedState;
}

/**
 * A hook that returns the dispatch function of a store.
 *
 * @param store - The store which will be updated with the dispatch function's argument. If not provided, the most immediate parent store is used
 * @returns The dispatch function for the store.
 */
export function useDispatch<T extends object>(store?: Store<T>) {
  const storeContext = store
    ? (storeManager.contextsMap[store.id] as StoreContext<T>)
    : (storeManager.lastContext as StoreContext<T>);

  if (!storeContext) {
    // If Store.Provider was not used at all (context was never registered)
    throw new Error('useDispatch must be used within a LiteStore.Provider');
  }

  const storeContextValue = useContext(storeContext);
  if (!storeContextValue) {
    // If Store.Provider was used, but the hook is called from a sibling/parent component
    throw new Error('useStore must be used within a Store.Provider');
  }

  return storeContextValue.updateState;
}
