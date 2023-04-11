# React Nimble Store
React Nimble Store is a lightweight state management library for React applications based on React's Context API. 

It lives up to its name by providing an easy-to-use API to manage state in your React applications, with all the tools features necessary for performance, and without the overhead of more complex state management solutions.

## Motivation
The main drawback when using the Context API is that _all_ consumers re-render when the state of the provider changes. The higher up the component tree the provider is, the worse the problem.

This abstraction aims to target that drawback in a rather simple lightweight approach that relies on the pub-sub pattern to manually trigger re-renders instead of using state.

In many cases, using a full-featured state management library like Redux is overkill when the goal is just to share state between a few components in different parts of your app. 

## Inspiration
The pattern used is _heavily_ inspired by [this great video](https://www.youtube.com/watch?v=ZKlXqrcBx88) from Jack Herrington, and the library borrows the names of its hooks from Redux. 

However, unlike Redux, the concept of actions and reducers is non-existent. This is just a supercharged context, nothing more.

## Features

- Simple API for creating a store and accessing state.
- Efficient state updates that only re-render components when necessary.
- Supports custom selectors and equality comparison functions.
- No dependencies, built on React's context and hooks.
- Stores are reusable (one store, many providers).
- Nested providers of one or various stores.
- Easy consumption of various stores without any store merging.

## Installation

This library is not yet published. 

## Usage

### 1. Create a Store

Create a new store by calling `createStore` and providing a state builder function. The state builder function receives a `setState` function as its argument and should return the initial state.

```tsx
interface ICounterStore {
  counter: number;
  increment: () => void;
  decrement: () => void;
}

const CounterStore = createStore<ICounterStore>((setState) => ({
  counter: 0,
  increment:() => setState((state) => ({ counter: state.counter + 1 })),
  decrement:() => setState((state) => ({ counter: state.counter - 1 })),
}));
```

### 2. Provide the Store

Wrap your application or a part of it with the `Provider` component exported by the store.

```tsx
function CounterWrapper() {
  return (
    // Without overriding `value` the provider forwards the initial state
    <CounterStore.Provider>
      <Counter />
    </CounterStore.Provider>
  )
}
```

### 3. Consume the Store
Access the store's state and actions using the `useStore` hook exported by the store.

```tsx
function Counter() {
  // Fetch the provided context as-is
  const { counter, increment, decrement } = CounterStore.useStore();

  // This component re-renders when any element in the store changes
  return (
    <div>
      <button onClick={decrement}>-</button>
      <span>{counter}</span>
      <button onClick={increment}>+</button>
    </div>
  );
}
```

## Advanced Usage

### Custom Selectors

You can use a custom selector function with `useStore` to return a specific part of the state. The selector function receives the state as its argument and should return the desired data.

```tsx
function CounterDisplay() {
  // Only the `counter` value from the state will be used in this component
  const counter = CounterStore.useStore((state) => state.counter);

  return <div>Counter: {counter}</div>;
}
```

> ** Note **
>
> Unless your state rarely changes, or you want your component to react to the entire store, 
> it is recommended to always use this pattern

### Custom Equality Comparison

By default, `useStore` uses strict equality (`===`) to determine if the selected state has changed. You can provide a custom comparison function to implement more advanced equality checks. The comparison function receives two arguments, the current and next selected state, and should return a boolean value.

```tsx
function CounterEven() {
  // Only re-render when `counter` goes from even to even or odd to odd
  const counter = CounterStore.useStore(
    (state) => state.counter,
    (prev, next) => prev % 2 === next % 2
  );

  return <div>Counter (even): {counter}</div>;
}
```

## API

- ### `createStore(stateBuilder): Store`:
Creates a new store object for managing state in a React application.
  - Receives a `stateBuilder` argument - A callback used to set up the store. It receives a `setState` function as its argument and should return the initial state.

  - Returns a `Store` object with the following properties:
    - `Provider` - A component that wraps your application or a part of it, providing access to the store's state.
    - `useStore` - A hook that allows you to access the store's state and actions. _Must_ be used within a component wrapped by a `Store.Provider`.

### `Store.Provider`
A component that wraps your application or a part of it, providing access to the store's state. It accepts the following props:

- `children` - The React components to be rendered inside the provider.
- `value` - An optional callback function used to set up the store. If provided, it will override the `stateBuilder` used when creating the store.

### `Store.useStore`
A hook that allows you to access the store's state and actions.

- `selector` - An optional callback function used to select a specific part of the state. If not provided, the entire state object will be used.
- `predicate` - An optional callback function used to provide custom comparison logic when "===" is not enough. If not provided, strict equality ("===") will be used.

Returns the selected state or the entire state object if no selector is provided.
