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
        <DisplayedIcons />
        <div style={{ margin: 10 }}>
          <NonReactiveConsumer />
        </div>
      </div>
    </SliderStore.Provider>
  );
}

function SliderWrapper() {
  const step = SliderStore.useStore((state) => state.step);

  return (
    <div>
      <h4 style={{ margin: '0px 0 10px 0' }}> Step: {step} </h4>
      <hr />
      <Slider />
    </div>
  );
}

function DisplayedIcons() {
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

  const renderRef = useRef(0);

  const handleSliderChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = +event.target.value;
      setCount(value);
    },
    [setCount]
  );

  return (
    <>
      <p>Renders: {++renderRef.current}</p>
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
    </>
  );
}

function NonReactiveConsumer() {
  // When called, subscribes to changes in the store based on the provided selector & predicate
  // If no selector is passed, any change in the store is detected
  const subscribe = SliderStore.useSubscribe((state) => state.count);

  // A function that returns the current state in the store
  const getState = SliderStore.useGetState();

  const renderRef = useRef(0);

  useEffect(() => {
    // Subscribe to changes and return the unsubscribe callback to clean up on unmount
    return subscribe(() => console.log('NEW VALUE', getState().count));
  }, [subscribe, getState]);

  return (
    <div style={{ border: '1px solid red', padding: 10 }}>
      <p>Renders: {++renderRef.current}</p>
      <p>This component does NOT re-render, even though it is listening to changes in the store.</p>
      <hr style={{ width: '100%' }} />

      <p>Change the slider and check the console to see DETECTED CHANGE</p>

      <span>Click this button to log the current state in the store.</span>
      <button onClick={() => console.log(getState())}>Log Current State</button>
    </div>
  );
}
