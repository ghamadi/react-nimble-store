import { useCallback } from 'react';
import { createStore } from '~/lib/create-store';
import { useDispatch, useSelector } from '~/lib/hooks';

interface IGlobalStore {
  counter1: number;
  counter2: number;
}

const CounterLabel: Record<keyof IGlobalStore, string> = {
  counter1: 'Counter 1',
  counter2: 'Counter 2'
};

const GlobalStore = createStore({ counter1: 0, counter2: 0 });

function IncrementButton({ counterKey }: { counterKey: keyof IGlobalStore }) {
  // Use the most immediate parent
  const counter = useSelector<IGlobalStore, number>((state) => state[counterKey]);
  const dispatch = useDispatch<IGlobalStore>();

  const increment = useCallback(() => {
    dispatch({ [counterKey]: counter + 1 });
  }, [counter, counterKey, dispatch]);

  return <button onClick={increment}>Increment</button>;
}

function CountDisplay({ counterKey }: { counterKey: keyof IGlobalStore }) {
  // explicitly pass the store to be used
  const counter = useSelector((state) => state[counterKey], GlobalStore);
  const text = `Value of ${CounterLabel[counterKey]}: ${counter}`;

  return <h3>{text}</h3>;
}

export default function App() {
  return (
    <GlobalStore.Provider>
      <div>
        <p>
          The two sections below are using the same store, but each refers to a different part of it
        </p>
        <hr />

        <h1>Counter 1</h1>
        <div>
          <p>The following re-renders only when counter1 updates</p>
          <CountDisplay counterKey="counter1" />
          <IncrementButton counterKey="counter1" />
        </div>
        <hr />

        <h1>Counter 2</h1>
        <div>
          <p>The following re-renders only when counter2 updates</p>
          <CountDisplay counterKey="counter2" />
          <IncrementButton counterKey="counter2" />
        </div>
        <hr />
      </div>
    </GlobalStore.Provider>
  );
}
