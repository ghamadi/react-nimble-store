import { ChangeEvent, useCallback } from 'react';
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

export default function SiblingProviders() {
  return (
    <div
      style={{
        width: '700px',
        gap: 30,
        margin: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <h3>Sibling Providers Example</h3>
      <SliderConfigProvider step={1} />
      <SliderConfigProvider step={5} />
      <SliderConfigProvider step={10} />
    </div>
  );
}

function SliderConfigProvider(props: { step: number }) {
  return (
    <SliderStore.Provider
      value={(setState) => ({
        count: 0,
        step: props.step,
        setCount(value) {
          setState({ count: value });
        }
      })}
    >
      <div style={{ border: '1px solid', padding: 20 }}>
        <SliderWrapper />
        <DisplayedApples />
      </div>
    </SliderStore.Provider>
  );
}

function SliderWrapper() {
  const step = SliderStore.useStore((state) => state.step);

  return (
    <div>
      <h4 style={{ margin: '0px 0 10px 0' }}> Step: {step} </h4>
      <Slider />
    </div>
  );
}

function DisplayedApples() {
  const count = SliderStore.useStore((state) => state.count);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      {[...Array(count).keys()].map((i) => {
        return <img key={i} src="/vite.svg" alt="" />;
      })}
    </div>
  );
}

function Slider() {
  const step = SliderStore.useStore((state) => state.step);
  const count = SliderStore.useStore((state) => state.count);
  const setCount = SliderStore.useStore((state) => state.setCount);

  const handleSliderChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = +event.target.value;
      setCount(value);
    },
    [setCount]
  );

  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
      <input
        type="range"
        step={step}
        min="0"
        max="50"
        value={count}
        onChange={handleSliderChange}
        style={{ flex: 1 }}
      />
      <span>{count}</span>
    </div>
  );
}
