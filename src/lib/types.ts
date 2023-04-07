/* eslint-disable @typescript-eslint/no-explicit-any */
import { Context as ReactContext } from 'react';

export type Exactly<T, U> = T & Record<Exclude<keyof U, keyof T>, T[keyof T]>;

export type StoreContext<T = unknown> = ReactContext<StoreContextValue<T, string> | undefined>;
export type StoreContextValue<T, S extends string> = {
  getState: () => T;
  getActions: () => StoreActions<S>;
  subscribe: (callback: () => void) => () => void;
};

export type StateSelector<T, E> = (state: T) => E;
export type SelectorOptions<T, E> = {
  selector?: StateSelector<T, E>;
  predicate?: (arg1: E, arg2: E) => boolean;
};

export type StoreActions<S extends string> = { [k in S]: (...args: any[]) => void };
export type StoreActionsBuilder<T, S extends string> = (
  setState: StateSetter<T>
) => StoreActions<S>;

export type StateSetter<T> = (arg: StateSetterArg<T>) => void;
export type StateSetterArg<T> = StateSetterCallback<T> | Exactly<T, Partial<T>>;
export type StateSetterCallback<T> = (state: T) => T;
