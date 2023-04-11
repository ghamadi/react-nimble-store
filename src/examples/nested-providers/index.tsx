import { ChangeEvent, useCallback, useEffect, useRef } from 'react';
import { createStore } from '~/lib/create-store';

interface Store {
  count: number;
  step: number;
  setCount: (value: number) => void;
}

const SliderStore = createStore<Store>((setState) => ({
  count: 0,
  step: 1,
  setCount(value: number) {
    setState({ count: value });
  }
}));

function Slider() {
  const step = SliderStore.useStore((state) => state.step);
  const count = SliderStore.useStore((state) => state.count);
  const setCount = SliderStore.useStore((state) => state.setCount);
  const rendersCount = useRef(1);

  useEffect(() => {
    rendersCount.current++;
  });

  const handleSliderChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = +event.target.value;
      setCount(value);
    },
    [setCount]
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        <p> Step: {step} </p>
        <p> Renders: {rendersCount.current} </p>
      </div>
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

export default function SiblingProviders() {
  return (
    <div
      style={{
        width: '500px',
        gap: 10,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <h3>Sibling Providers Example</h3>
      <SliderWrapper />
      <SliderWrapper step={5} />
      <SliderWrapper step={10} />
    </div>
  );
}

function SliderWrapper(props: { step?: number }) {
  return (
    <SliderStore.Provider
      value={(setState) => ({
        count: 0,
        step: props.step ?? 1,
        setCount(value) {
          setState({ count: value });
        }
      })}
    >
      <div style={{ border: '1px solid', padding: 10 }}>
        <Slider />
      </div>
    </SliderStore.Provider>
  );
}
