import { ReactNode } from 'react';
import { StoreContext } from '~/lib/types';

type StoreParams<T> = {
  id: number;
  Context: StoreContext<T>;
  Provider: (props: { children: ReactNode }) => JSX.Element;
};

export class Store<T> {
  readonly id: number;
  readonly Provider: (props: { children: ReactNode }) => JSX.Element;

  constructor({ id, Provider }: StoreParams<T>) {
    this.id = id;
    this.Provider = Provider;
  }
}
