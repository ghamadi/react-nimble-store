import { ChangeEvent } from 'react';
import { createStore } from '~/lib/create-store';
import { useActions, useStore } from '~/lib/hooks';

interface ICounters {
  x: number;
  y: number;
  z: number;
}

type ICountersActions = {
  increment(key: keyof ICounters): void;
  decrement(key: keyof ICounters): void;
  set(key: keyof ICounters, value: ICounters[keyof ICounters]): void;
};

const CountersState: ICounters = { x: 0, y: 0, z: 0 };

const CountersStore = createStore(CountersState, (setState) => ({
  increment(key: keyof ICounters) {
    setState((state) => ({ ...state, [key]: state[key] + 1 }));
  },

  decrement(key: keyof ICounters) {
    setState((state) => ({ ...state, [key]: state[key] - 1 }));
  },

  set(key: keyof ICounters, value: ICounters[keyof ICounters]) {
    setState((state) => ({ ...state, [key]: value }));
  }
}));

function CounterInput({ counterKey }: { counterKey: keyof ICounters }) {
  const value = useStore(CountersStore, { selector: (state) => state[counterKey] });

  const { increment, decrement, set } = useActions<ICountersActions>(CountersStore);

  const inputChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    set(counterKey, +e.target.value);
  };

  return (
    <div>
      <h3>Value of {counterKey}:</h3>
      <input value={value} onChange={inputChangeHandler} />
      <button onClick={() => increment(counterKey)}>Increment</button>
      <button onClick={() => decrement(counterKey)}>Decrement</button>
    </div>
  );
}

function DisplaySum() {
  const { x, y } = useStore(CountersStore, {
    selector: ({ x, y }) => ({ x, y }),
    predicate: (arg1, arg2) => JSON.stringify(arg1) === JSON.stringify(arg2)
  });

  // the type of the selected value is automatically inferred when `options.store` is provided
  return <h3>The product of X & Y is: {x * y}</h3>;
}

function ConsumerThatDoesNotReact() {
  useStore(CountersStore, { selector: (_state) => null });

  return <p>This component does not re-render despite calling the `useStore` hook</p>;
}

export default function App() {
  return (
    // The `Provider` does not take props besides `children`
    <CountersStore.Provider>
      {/* Only renders when X changes*/}
      <CounterInput counterKey="x" />

      {/* Only renders when Y changes*/}
      <CounterInput counterKey="y" />

      {/* Only renders when Z changes*/}
      <CounterInput counterKey="z" />

      <hr style={{ margin: '20px 0' }} />

      {/* Only renders when X or Y change */}
      <DisplaySum />

      {/* Does not react to changes in the store */}
      <ConsumerThatDoesNotReact />
    </CountersStore.Provider>
  );
}
