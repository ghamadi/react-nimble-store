import { ChangeEvent, useCallback } from 'react';
import { createStore } from '~/lib/create-store';

interface Store {
  count: number;
  step: number;
  setCount: (value: number) => void;
}

const CounterStore = createStore<Store>((setState) => ({
  count: 0,
  step: 1,
  setCount(value: number) {
    setState({ count: value });
  }
}));

function Slider() {
  const step = CounterStore.useStore((state) => state.step);
  const count = CounterStore.useStore((state) => state.count);
  const setCount = CounterStore.useStore((state) => state.setCount);

  const handleSliderChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = +event.target.value;
      setCount(value);
    },
    [setCount]
  );

  return (
    <div>
      <h4> Step: {step} </h4>
      <h4> Count: {count} </h4>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input
          type="range"
          step={step}
          min="0"
          max="50"
          value={count}
          onChange={handleSliderChange}
          style={{ width: '100%' }}
        />
        <span>{count}</span>
      </div>
    </div>
  );
}

export default function NestedProvidersExample() {
  return (
    <CounterStore.Provider>
      <h3>Nested Providers Example</h3>
      <div style={{ width: '500px' }}>
        <Slider />
        <NestedSlider />
      </div>
    </CounterStore.Provider>
  );
}

function NestedSlider() {
  return (
    <CounterStore.Provider
      value={(setState) => ({
        setCount(value) {
          setState({ count: value });
        },
        count: 0,
        step: 5
      })}
    >
      <Slider />
    </CounterStore.Provider>
  );
}
