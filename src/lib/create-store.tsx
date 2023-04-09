import {
  createContext,
  ReactNode,
  useRef,
  useCallback,
  useContext,
  useState,
  useEffect
} from 'react';

// A utility type to return the partial of a type without allowing extra properties
type Exactly<T, P> = T & Record<Exclude<keyof P, keyof T>, T[keyof T]>;

type StoreContextValue<T, A> = {
  getState: () => T;
  getActions: () => A;
  subscribe: (callback: () => void) => () => void;
};

type StateSetter<T> = (arg: StateSetterArg<T>) => void;
type StateSetterArg<T> = StateSetterCallback<T> | Exactly<T, Partial<T>>;
type StateSetterCallback<T> = (state: T) => T;

type Selector<T, R> = (state: T) => R;
type Predicate<T> = (arg1: T, arg2: T) => boolean;

type ActionsBuilder<T, A> = (setState: StateSetter<T>) => A;

type ProviderProps<T, A> = {
  children: ReactNode;
  value?: {
    state: T;
    actions?: ActionsBuilder<T, A>;
  };
};

export type Store<T, A> = {
  Provider: (props: ProviderProps<T, A>) => JSX.Element;
  useActions: () => A;
  useStore: <R>(selector?: (state: T) => R, predicate?: (arg1: R, arg2: R) => boolean) => R;
};

/**
 * Creates a Store object for managing state in a React application.
 *
 * The returned `Store` exposes a `Provider` component — a wrapper for `Context.Provider`, and
 * consuming hooks setup to efficiently trigger the consumer components' re-rendering where needed only.
 *
 * @param state - The initial state of the store.
 * @returns A `Store` object
 */
export function createStore<T, A>(state: T, actions?: ActionsBuilder<T, A>): Store<T, A> {
  const Context = createContext<StoreContextValue<T, A> | undefined>(undefined);
  const subscribers = new Set<() => void>([]);

  function Provider(props: ProviderProps<T, A>) {
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
    const setState: StateSetter<T> = useCallback((input) => {
      switch (typeof input) {
        case 'function':
          stateRef.current = structuredClone(input(stateRef.current));
          break;
        case 'object':
          stateRef.current = structuredClone({ ...stateRef.current, ...input });
          break;
        default:
          stateRef.current = structuredClone(input);
      }
      subscribers.forEach((callback) => callback());
    }, []);

    // Initialize the context value passed to the provider
    const stateRef = useRef(props.value?.state ?? state);
    const actionsRef = useRef((props.value?.actions ?? actions)?.(setState) ?? ({} as A));
    const contextValue: StoreContextValue<T, A> = {
      getState,
      getActions,
      subscribe
    };

    return <Context.Provider value={contextValue}>{props.children}</Context.Provider>;
  }

  /**
   * Hook to provide the set of actions provided in the store that can trigger state change
   *
   * @returns the store's `actions` object
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
  function useStore<R>(selector?: Selector<T, R>, predicate?: Predicate<R>) {
    // Rentires the entire state object if `selector` is undefined
    const selectorFn: Selector<T, R> = useCallback(
      (state) => (selector ? selector(state) : (state as unknown as R)),
      [selector]
    );

    // Defaults to "===" if `predicate` is undefined.
    const equalityChecker: Predicate<R> = useCallback(
      (arg1, arg2) => (predicate ? predicate(arg1, arg2) : arg1 === arg2),
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
