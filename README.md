# React Nimble Context
This is a minimalistic library that is essentially an abstraction of React's Context API with a focus on efficiency.

## Motivation
The main drawback when using the Context API is that _all_ consumers re-render when the state of the provider changes. The higher up the component tree the provider is, the worse the problem.

This abstraction aims to target that drawback in a rather simple lightweight approach that relies on the pub-sub pattern to manually trigger re-renders instead of using state.

In many cases, using a full-featured state management library like Redux is overkill when the goal is just to share state between a few components in different parts of your app. 

## Inspiration
The pattern used is _heavily_ inspired by [this great video](https://www.youtube.com/watch?v=ZKlXqrcBx88) from Jack Herrington, and the library borrows the names of its hooks from Redux. 

However, unlike Redux, the concept of actions and reducers is non-existent. This is just a supercharged context, nothing more.

## Usage
### Installation
This is still unpublished. You can still use the library by copying the files in the `lib` folder to your project. There are no dependencies beyond React for this project.

### Example
There are three steps to using the nimble context: 
1. Create a store outside of your component using `createStore`
2. Wrap your components with `Store.Provider`
3. Read any part of the store via `useSelector` and update the state via `useDispatch`

```tsx
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

  // the type of the selected value is automatically inferred when `options.store` is provided
  return <h3>The product of X & Y is: {x * y}</h3>;
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
```
---

> **Note**
>
> While using this library to establish a global store in your app will not affect performance, following the best practices of the Context API is still recommended for maintainability reasons. As such, it is generally recommended to: 
> - Create different stores for different kinds of state
> - Collocate your stores with the component that sematically owns the state
> - Default to `props` unless sharing state is necessary