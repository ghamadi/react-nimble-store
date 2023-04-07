import {
  createContext,
  ReactNode,
  useRef,
  useCallback,
  useContext,
  useState,
  useEffect
} from 'react';

type Exactly<T, P> = T & Record<Exclude<keyof P, keyof T>, T[keyof T]>;

type StoreContextValue<T, A> = {
  getState: () => T;
  getActions: () => A;
  subscribe: (callback: () => void) => () => void;
};

type StateSetter<T> = (arg: StateSetterArg<T>) => void;
type StateSetterArg<T> = StateSetterCallback<T> | Exactly<T, Partial<T>>;
type StateSetterCallback<T> = (state: T) => T;

export type Store<T, A> = {
  Provider: (props: { children: ReactNode }) => JSX.Element;
  useActions: () => A;
  useStore: <R>(selector?: (state: T) => R, predicate?: (arg1: R, arg2: R) => boolean) => R;
};

/**
 * Creates a Store object for managing state in a React application.
 *
 * The returned `Store` exposes a `Provider` component — a wrapper for `Context.Provider` that's
 * setup to efficiently trigger the children's re-rendering where needed only.
 *
 * @param state - The initial state of the store.
 * @returns An object containing the context and provider for the store.
 */
export function createStore<T, A>(
  state: T,
  actions?: (setState: StateSetter<T>) => A
): Store<T, A> {
  const Context = createContext<StoreContextValue<T, A> | undefined>(undefined);
  const subscribers = new Set<() => void>([]);

  function Provider(props: { children: ReactNode }) {
    // Returns the current version of the state
    const getState = useCallback(() => stateRef.current, []);

    // Returns the current version of the actions
    const getActions = useCallback(() => actionsRef.current, []);

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

    // Initialize the context value passed to the provider
    const stateRef = useRef(state);
    const actionsRef = useRef(actions?.(setState) ?? ({} as A));
    const contextValue: StoreContextValue<T, A> = {
      getState,
      getActions,
      subscribe
    };

    return <Context.Provider value={contextValue}>{props.children}</Context.Provider>;
  }

  /**
   *
   * @returns the store's _actions_ object
   */
  function useActions() {
    const contextValue = useContextValue('useActions');
    return contextValue.getActions();
  }

  /**
   * Hook to return any value from the store's `state` object. The output can be any data of any type.
   *
   * @param selector  - A callback to return data from the store
   * @param predicate - An equality checker callback to provider custom comparison logic when "===" is not enough
   * @returns data from the `state` of the closest parent provider
   */
  function useStore<R>(selector?: (state: T) => R, predicate?: (arg1: R, arg2: R) => boolean) {
    // Rentires the entire state object if `selector` is undefined
    const selectorFn = useCallback(
      (state: T) => (selector ? selector(state) : (state as unknown as R)),
      [selector]
    );

    // Defaults to "===" if `predicate` is undefined.
    const equalityChecker = useCallback(
      (arg1: R, arg2: R) => (predicate ? predicate(arg1, arg2) : arg1 === arg2),
      [predicate]
    );

    const contextValue = useContextValue('useStore');
    const { getState, subscribe } = contextValue;
    const [selectedState, setSelectedState] = useState(selectorFn(getState()));

    useEffect(() => {
      return subscribe(() => {
        const newValue = selectorFn(getState());
        if (!equalityChecker(newValue, selectedState)) {
          setSelectedState(newValue);
        }
      });
    }, [equalityChecker, getState, selectedState, selectorFn, subscribe]);

    return selectedState;
  }

  /**
   * Internal hook used for validating a Provider parent exists
   *
   * @param hookName - The name of the calling hook. Used in the error message to help debugging.
   * @returns the output of `useContext` assuming a `Provider` exists as a parent
   * @throws an error if the `useContext` returns undefined
   */
  function useContextValue(hookName: string) {
    const contextValue = useContext(Context);
    if (!contextValue) {
      throw new Error(`${hookName} must be used within a Store.Provider`);
    }
    return contextValue;
  }

  return {
    Provider,
    useActions,
    useStore
  };
}
