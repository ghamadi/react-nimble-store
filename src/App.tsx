import { ChangeEvent } from 'react';
import { createStore } from '~/lib/create-store';
import { useSelector, useDispatch } from '~/lib/hooks';

interface Values {
  x: number;
  y: number;
  z: number;
}

const ValuesStore = createStore<Values>({ x: 0, y: 0, z: 0 });

function ValueInput({ valueKey }: { valueKey: keyof Values }) {
  const value = useSelector<Values, number>((state) => state[valueKey]);
  const dispatch = useDispatch(ValuesStore);

  const inputChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch({ [valueKey]: +e.target.value });
  };

  const moveByOne = (direction: 'add' | 'sub') => {
    const offset = direction === 'add' ? 1 : -1;
    dispatch({ [valueKey]: value + offset });
  };

  return (
    <div>
      <h3>Value of {valueKey}:</h3>
      <input value={value} onChange={inputChangeHandler} />
      <button onClick={() => moveByOne('add')}>Increment</button>
      <button onClick={() => moveByOne('sub')}>Decrement</button>
    </div>
  );
}

function DisplaySum() {
  // you can also dictate the store that `useSelector` looks in
  const x = useSelector((state) => state.x, { store: ValuesStore });
  const y = useSelector((state) => state.y, { store: ValuesStore });

  // the type of the selected value is automatically when `options.store` is provided
  return <h3>The sum of `x` and `y` is: {x + y}</h3>;
}

function ConsumerThatDoesNotReact() {
  useSelector((_state) => null);

  return <p>This component does not re-render despite calling the `useSelector` hook</p>;
}

export default function App() {
  return (
    // The `Provider` does not take props besides `children`
    <ValuesStore.Provider>
      {/* Only renders when X changes*/}
      <ValueInput valueKey="x" />

      {/* Only renders when Y changes*/}
      <ValueInput valueKey="y" />

      {/* Only renders when Z changes*/}
      <ValueInput valueKey="z" />

      <hr style={{ margin: '20px 0' }} />

      {/* Only renders when X or Y change */}
      <DisplaySum />

      {/* Does not react to changes in the store */}
      <ConsumerThatDoesNotReact />
    </ValuesStore.Provider>
  );
}
