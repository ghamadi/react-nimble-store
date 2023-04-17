# React Nimble Store
React Nimble Store is a lightweight and efficient state management library for React applications.

It provides a simple API to create a store, access and update its state, and subscribe to state changes. It leverages the Context API under the hood, but enhances it with a subscription-based approach to ensure optimal performance and minimal re-rendering.

## Motivation
The main drawback when using the Context API is that _all_ consumers re-render when the state of the provider changes. The higher up the component tree the provider is, the higher the performance impact. However, React Context remains a very effective - and very flexible - tool to share state.

This library targets that efficiency drawback in a rather simple, lightweight approach that rotates around the Context API. In essence, a Store is not much more than a supercharged Context, and the API for using it was designed to be as close as possible to that of the Context API.

## Features
- Simple API for creating a store and accessing its state
- Reusable store instance (one store, many providers)
- Consuming multiple stores (many stores, many providers)
- Customizable selectors for granular access to state data
- Support for custom comparison logic for efficient state updates
- Transient updates: tracking store changes without re-rendering the consumer
- Type-safe hooks for accessing and updating state
- Middleware support 

## Basic Usage
There are three main steps to utilizing Nimble. 

1. Create the store
```jsx
const { Provider, useStore } = createStore((setState, getState) => ({
    counter: 0,
    setCount: (value) => setState({counter: value}),
    increment: () => setState((state) => ({ counter: state.counter + 1 })),
    decrement: () => setState((state) => ({ counter: state.counter - 1 })),
}));
```

2. Wrap your application or a part of it with the `Provider`
```jsx
function CounterWrapper() {
  return (
    <Provider>
      <Counter />
    </Provider>
  )
}
```

3. Consume the store from any child of `Provider`
```jsx
function Counter() {
  const counter = useStore((state) => state.counter);
  const increment = useStore((state) => state.increment);
  const decrement = useStore((state) => state.decrement);

  return (
    <div>
      <h1>Counter: {counter}</h1>
      <button onClick={increment}>Increment</button>
      <button onClick={decrement}>Decrement</button>
    </div>
  );
}
```

> **Note**
>
> As an alternative to the above three selectors, we could use `const {counter, increment, decrement} = useStore()`.
> However, if you do not need all the store's properties (like we do here), you should _always_ pass a selector argument.

### Usage with Typescript
Using Nimble with Typescript is dead simple; just pass a type argument to `createStore`.
```tsx
interface ICounterStore {
  counter: number;
  increment: () => void;
  decrement: () => void;
  setCount: (value: number) => void;
}

const CounterStore = createStore<ICounterStore>((setState, getState) => {
  return {
    counter: 0,
    setCount: (value) => setState({counter: value}),
    increment: () => setState((state) => ({ counter: state.counter + 1 })),
    decrement: () => setState((state) => ({ counter: state.counter - 1 })),
  };
});
```

That's it! Now the provider and the consumption hooks are typed.

## Reusing the Store Instance
Continuing with the counter example above, imagine you have two (or more) sections in your app, each requiring its own instance of the `CounterStore`. Instead of duplicating your code and creating two (or more) stores for each section, you can just wrap each section with its own `Provider`.

```jsx
const { Provider, useStore } = createStore(...)

function App() {
  return (
    <>
      <Provider>
        <h1>This section fills the Apples Basket</h1>
        <FruitSection fruit="apples" />
      </Provider>

      <Provider>
        <h1>This section fills the Oranges Basket</h1>
        <FruitSection fruit="oranges" />
      </Provider>
    </>
  )
}

function FruitSection({fruit}) {
  const increment = useStore((state) => state.increment);
  const decrement = useStore((state) => state.decrement);

  return (
    <div>
      <button onClick={increment}>Increment</button>
      <button onClick={decrement}>Decrement</button>
      <hr />
      <FruitBasket fruit={fruit} />
    </div>
  );
}

function FruitBasket({fruit}) {
  const counter = useStore((state) => state.counter);

  return (
    <div>
      <h2>{fruit} count: {counter}</h2>
      <div>
        {[...Array(count).keys()].map((i) => {
          return <img key={i} src={`/icons/${fruit}`} />;
        })}
      </div>
    </div>
  );
}
```

## Using Multiple Stores
Typically, you may want to separate your state into different stores for better organization. This is achievable the same way it is with contexts—by combining providers in a parent-child or sibling relationship.

```jsx
const { Provider: CounterProvider, useStore: useCounterStore } = crateStore(...)
const { Provider: ThemeProvider, useStore: useThemeStore } = crateStore(...)

function App() {
  return (
    <ThemeProvider>

      <CounterProvider>
        <FruitSection fruit="apples" />
      </CounterProvider>

      <CounterProvider>
        <FruitSection fruit="oranges" />
      </CounterProvider>

    </ThemeProvider>
  )
}
```

## Overriding State
Sometimes you want to nest providers of the same store instance in order to override part of the initial state for a given subtree. Achieving this is simple using the optional `value` prop of the store's `Provider`.

```jsx
const themeState = (setState) => ({
  theme: 'light',
  toggleTheme: () => setState((state) => ({ 
    theme: state.theme === 'light' ? 'dark' : 'light' 
  }))
})

const { Provider: ThemeProvider, useStore: useThemeStore } = crateStore(themeState)

function App() {
  return (
    <ThemeProvider>

      {/* The default theme for this section is 'light' */}
      <CounterProvider>
        <FruitSection fruit="apples" />
      </CounterProvider>

      <ThemeProvider 
        value={(setState) => ({
         ...themeState(setState),
         theme: 'dark' // set a different default theme for this section
        })}
      >
        <CounterProvider>
          <FruitSection fruit="oranges" />
        </CounterProvider>
      </ThemeProvider>

    </ThemeProvider>
  )
}
```

## Combining Stores
You can establish a "global" store by combining your various stores. This is achieveable in two ways:

1. By creating a global `Provider` without merging stores
```jsx
function GlobalProvider({children}) {
  <ThemeProvider>
    <AuthProvider>
      <CounterProvider>
        {children}
      </CounterProvider>
    </AuthProvider>
  </ThemeProvider>
}
```

2. If you prefer to create one global store, you can use slices. However, keep in mind that you need to maintain unique names for properties and actions across the slices.
```jsx
const counterSlice = (setState, getState) => ({
  count: 0,
  setCount: (value) => setState({count: value})
})

const themeSlice = (setState, getState) => ({
  theme: 'light',
  toggleTheme: () => setState((state) => ({ 
    theme: state.theme === 'light' ? 'dark' : 'light' 
  }))
})

const GlobalStore = createStore((setState, getState) => ({
  ...counterSlice(setState, getState),
  ...themeSlice(setState, getState)
}))
```
In general, though, it might be a good idea to keep your state decentralized and colocate stores with their semantic owners for most use-cases.

## Variations of `useStore`
The `useStore` hook allows you to access part or all of the state in your store, and subscribe to changes in the selected state to trigger a component re-render. 

There are three ways in which you can use `useStore`

```jsx
// grabs the entire state and reacts to any change in the state
const selection = useStore();
```

```jsx
// grabs `someProperty` from the store's state, and only reacts when its value changes
const selection = useStore(state => state.someProperty)
```

```jsx
import isEqual from 'lodash.isequal';

// Uses the `predicate` argument to decide when to react to a change
const selection = useStore(state => ({  p1: state.p1,  p2: state.p2 }, isEqual))
```

The `predicate` argument is any function that takes two arguments and returns a boolean. Generally, you would use this argument to perform a custom comparison between the previous selection and the new one. However, keep in mind that you do not need to use it strictly for an equality check.

```jsx
function CounterEven() {
  // Only re-render when `counter` goes from even to odd or vice versa
  const counter = CounterStore.useStore(
    (state) => state.counter,
    (prev, next) => prev % 2 === next % 2
  );

  return <div>Counter: {counter}</div>;
}
```

## Accessing State Without Subscribing to Changes
The `useStore` hook has everything needed to grab or map state from your store. However, there might be cases where you want to read the state, but don't want your component re-rendering when that state changes. 

This can be useful when your component is already subscribed to some part of the store, and needs to access more state _when_ that part changes. 

It can also be useful when you only need to check the state while handling an event.

```jsx
const Store = createStore((setState) => ({
  text: '',
  setText: (value) => setState({text: value})
}))

function TextInput() {
  const setText = Store.useStore((state) => state.setText);
  const getState = Store.useGetState();

  // Update, but do not react to changes in the store
  const handleChange = (event) => {
    setText(event.target.value);
  };

  // Access the current state when the `submit` button is clicked
  const handleSubmit = () => {
    const state = getState();
    console.log(`Submitted text: ${state.text}`);
  };

  return (
    <div>
      <input type="text" onChange={handleChange} />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}

function App() {
  return (
    <Store.Provider>
      <TextInput />
    </Store.Provider>
  )
}
```

## Transient Update: Subscribing to State Change _Without_ Rerendering
Sometimes you want to listen to changes in the state, but you do not need to rerender the component every time it changes. This is where `useSubscribe` comes in.

A typical use-case for this is when you want to perform a side effect when the state changes. The rendered component does not care about the state, so `useStore` is not the ideal option.

```jsx
function CountLogger() {
  const getState = Store.useGetState()

  // listen ONLY to changes in `count`
  const subscribe = Store.useSubscribe(state => state.count)

  useEffect(() => {
    // the subscribe callback will always receive the updated state based on the selector passed to `useSubscribe`
    const unsubscribe = subscribe((count) => {
      console.log(`The count is now: ${count}`)
    })

    return () => unsubscribe();
  }, [])

  return null
}
```

## Middleware Integration

`createStore` allows you to add middleware to your state management logic. Middleware is a higher-order function that intercepts the `setState` function and can modify the behavior of the state updates. 

To add middleware to your state management logic, simply pass it as the second argument to the createStore function.

```jsx
// Define a middleware function that logs state changes
const loggerMiddleware = (setState, getState) => {
  return input => {
    console.log('Previous state:', getState());
    console.log('Action:', input);
    setState(input);
    console.log('Next state:', getState());
  };
};

// Define the state builder function that returns the state object
const stateBuilder = (setState, getState) => {
  // ...
};

// Create the store with the middleware
const { Provider, useStore } = createStore(stateBuilder, loggerMiddleware);

```

Note that when defining a state-builder or middleware function separate from `createStore` in TypeScript, you do not need to define types for their arguments.

```tsx
interface Store {
  // ...
}

// TS will infer the correct types for setState, getState, and input
const middleware: Middleware<Store> = (setState, getState) => {
  return input => {
    // ...
  };
};

// TS will infer the correct types for setState and getState
const stateBuilder: StateBuilder<Store> = (setState, getState) => {
  // ...
};

// The hooks are typed correctly
const { Provider, useStore } = createStore<Store>(stateBuilder, middleware);
```
