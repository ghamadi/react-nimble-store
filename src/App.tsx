import { ChangeEvent, useCallback, useEffect, useRef } from 'react';
import { Middleware, StateBuilder, createStore } from '~/lib/create-store';

interface SliderStore {
  count: number;
  step: number;
  setCount: (value: number) => void;
}

const loggingMiddleware: Middleware<SliderStore> = (set, get) => (input) => {
  const { count } = get();
  set(input);
  console.log(`Middleware log: count changed from ${count} to ${get().count}`);
};

const stateBuilder: StateBuilder<SliderStore> = (setState) => ({
  count: 0,
  step: 1,
  setCount(value: number) {
    setState({ count: value });
  }
});

const {
  Provider: SliderStoreProvider,
  useStore: useSliderStore,
  useGetState: useSliderStoreGetState,
  useSubscribe: useSliderStoreSubscribe
} = createStore<SliderStore>(stateBuilder, loggingMiddleware);

export default function App() {
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
      <h3>Features Demo</h3>
      <span>Each section below interacts with a separate instance of the same `SliderStore`</span>
      <ViteIconsSlider step={1} />
      <ViteIconsSlider step={5} />
      <ViteIconsSlider step={10} />
    </div>
  );
}

// The store instance is reusable thanks to the reusability of its Provider
function ViteIconsSlider(props: { step: number }) {
  return (
    <SliderStoreProvider
      value={(setState, getState) => ({
        ...stateBuilder(setState, getState),
        step: props.step
      })}
    >
      <div style={{ border: '1px solid', padding: 20 }}>
        <h4 style={{ margin: '0px 0 10px 0' }}> Step: {props.step} </h4>
        <hr />
        <Slider />
        <DisplayedIcons />
        <div style={{ margin: 10 }}>
          <NonReactiveConsumer />
        </div>
      </div>
    </SliderStoreProvider>
  );
}

function DisplayedIcons() {
  const count = useSliderStore((state) => state.count);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      {[...Array(count).keys()].map((i) => {
        return <img key={i} src="/vite.svg" alt="" />;
      })}
    </div>
  );
}

function Slider() {
  const step = useSliderStore((state) => state.step);
  const count = useSliderStore((state) => state.count);
  const setCount = useSliderStore((state) => state.setCount);

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
  // If no selector is passed, any change in the store is detected
  const subscribe = useSliderStoreSubscribe((state) => state.count);

  useEffect(() => {
    // Subscribe to changes and return the unsubscribe callback to clean up on unmount
    return subscribe((newValue) => console.log('Current Count:', newValue));
  }, [subscribe]);

  const getState = useSliderStoreGetState();

  const renderRef = useRef(0);

  return (
    <div style={{ border: '1px solid red', padding: 10 }}>
      <p>Renders: {++renderRef.current}</p>
      <p>This component does NOT re-render, even though it is listening to changes in the store.</p>
      <p>Check the console when the slider moves to see it logging Current Count</p>
      <hr style={{ width: '100%' }} />

      <span>Click this button to log the current state in the store.</span>
      <button onClick={() => console.log(getState())}>Log Current State</button>
    </div>
  );
}
