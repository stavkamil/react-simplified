import { render } from './render';

export function init() {
  /**
   * React Hooks are a fundamental feature in modern React applications that provide a way
   * to manage state and side effects in functional components. Hooks enable developers to
   * add and reuse stateful logic.
   *
   * Here we initialize `hooks` array and `index` variable, they play a crucial role
   * in emulating React's hook system. The `hooks` array stores the state values and effect
   * dependencies for different hooks used in components. The `index` variable keeps track of
   * the current position within the `hooks` array as hooks are used and new components are rendered.
   *
   * When a functional component uses a hook like `useState` or `useEffect`, the implementation
   * stores the corresponding state or effect dependencies in the `hooks` array at the current
   * index. As components are rendered and hooks are used, the `index` is incremented to keep
   * track of the next position for storing hook-related data. This mechanism ensures that each
   * component's hooks are stored separately and can be accessed when needed.
   */
  const hooks = [];
  let index = 0;

  /**
   * @function useState
   * @description A custom hook that emulates React's `useState` hook.
   * @param {*} initialValue - The initial value of the state.
   * @returns {Array} - A pair of state value and setState function.
   *
   * The `useState` function simulates React's `useState` hook, which is a fundamental
   * tool for managing state within functional components. It provides a way to introduce
   * stateful behavior into function components.
   *
   * The function tracks the actual state value using the current index in the hooks array.
   * The `setState` function, when invoked, updates the state, triggers re-rendering of the
   * component, resets the index to ensure proper hook sequencing, and invokes the `render`
   * function to update the DOM based on the new state.
   *
   * While this implementation covers the core feature of `useState`, it does not include
   * certain optimizations and additional capabilities present in React's official version.
   * For instance, this implementation does not support lazy initialization of state, complex
   * state updates, or batching of state updates. Furthermore, it directly triggers rendering
   * for all components sharing the same `hooks` array, which might not be as optimized as
   * React's implementation.
   */
  function useState(initialValue) {
    const state = hooks[index] ?? initialValue;
    const currIndex = index;

    const setState = (newVal) => {
      const hasChanged = !Object.is(hooks[currIndex], newVal);
      if (hasChanged) {
        hooks[currIndex] = newVal;
        index = 0;
        render(hooks)();
      }
    };

    index++;
    return [state, setState];
  }

  /**
   * @function useEffect
   * @description A custom hook that emulates React's `useEffect` hook.
   * @param {Function} callback - The effect callback function to be executed.
   * @param {Array} depArr - An array of dependencies to track for changes.
   *
   * The `useEffect` function simulates React's `useEffect` hook, a vital tool for introducing
   * side effects in functional components. It enables components to manage side effects, such
   * as data fetching or DOM manipulations, after DOM rendering.
   *
   * This function tracks the provided dependency array (`depArr`) to determine whether the
   * effect should run. It compares the current dependencies with the previous ones stored in
   * the `hooks` array. If there are changes, the `callback` function is invoked. The `hooks`
   * array is then updated with the new dependencies, and the `index` is incremented to manage
   * subsequent hooks.
   *
   * While this implementation covers the core aspect of `useEffect`, it lacks certain features
   * found in React's official version. For instance, this implementation does not support
   * cleanup functions or optimizations like cleanup on unmount. Also, it doesn't handle
   * multiple effects with different dependencies within the same component, unlike React's
   * version.
   */

  function useEffect(callback, depArr) {
    let shouldRunEffect = true;
    const oldDeps = hooks[index];

    if (oldDeps) {
      shouldRunEffect = depArr.some((dep, i) => !Object.is(dep, oldDeps[i]));
    }

    if (shouldRunEffect) {
      callback();
    }

    hooks[index] = depArr;
    index++;
  }

  /**
   * @function createElement
   * @description A function to create React-like elements for virtual DOM representation.
   * @param {string} type - The type of the element, e.g., 'div', 'span', 'button', etc.
   * @param {Object} props - The properties and attributes to be assigned to the element.
   * @param {...(Object|string)} children - Child elements or text content for the element.
   *
   * The `createElement` function emulates React's element creation and virtual DOM concept.
   * It's responsible for generating a structured representation of UI elements that React
   * can use for efficient updates and rendering.
   *
   * This function accepts the `type`, `props`, and `children` parameters. It normalizes the
   * `children` array by converting non-object elements (text content) into a virtual text node
   * representation. The function then returns an object with the provided `type`, `props`, and
   * the normalized `children` array, forming a structured element representation for the
   * virtual DOM.
   *
   * This implementation covers the fundamental feature of creating element structures for a
   * virtual DOM, similar to React's createElement. However, it lacks certain optimizations
   * and features present in React. For example, it doesn't handle key properties
   * or JSX transformations like React's version does. Additionally, it doesn't include
   * advanced rendering optimizations that are part of the complete React library.
   */

  function createElement(type, props, ...children) {
    const normalizedChildren = children.map((child) =>
      typeof child === 'object'
        ? child
        : {
            type: 'TEXT_NODE',
            props: {
              nodeValue: child,
              children: [],
            },
          },
    );

    return {
      type,
      props: { ...props, children: normalizedChildren },
    };
  }

  return {
    createElement,
    useState,
    useEffect,
    render: render(hooks),
  };
}
