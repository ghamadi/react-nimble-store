import { ReactNode } from 'react';

type StoreParams<T> = {
  id: number;
  state: T;
  Provider: (props: { children: ReactNode }) => JSX.Element;
};

export class Store<T> {
  readonly id: number;
  readonly Provider: (props: { children: ReactNode }) => JSX.Element;
  readonly state: T;

  constructor({ id, state, Provider }: StoreParams<T>) {
    this.id = id;
    this.state = state;
    this.Provider = Provider;
  }
}
