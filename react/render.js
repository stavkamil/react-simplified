import { isEvent, isGone, isNew, isProperty } from './utils';

let _component = null;
let _root = null;
let _hooks = null;

/**
 * @function render
 * @description A custom function that emulates React's rendering process.
 * @param {Array} hooks - An array of hooks to manage state and effects.
 * @returns {Function} - A function to initiate rendering with component and root parameters.
 *
 * The `render` function replicates React's rendering mechanism by handling the reconciliation
 * of components and updating the DOM accordingly. It plays a pivotal role in converting the
 * virtual representation of UI components into actual DOM elements.
 *
 * The function accepts an array of hooks, which are used for state management and effects.
 * When invoked with component and root parameters, it begins the rendering process. It starts
 * by clearing the existing content of the root element. Then, it uses the `reconcile` function
 * to create a structured representation of the component hierarchy. The hooks, component, and
 * root elements are stored for future updates. Finally, the `createDom` function is called to
 * generate DOM elements based on the component representation, and the DOM is updated by
 * appending the created elements to the root.
 *
 * The `render` implementation covers the fundamental functionality of rendering components
 * and updating the DOM based on changes. However, it lacks certain features found in React.
 * For example, it does not handle unmounting of components or optimizing rendering through
 * diffing algorithms like React's Virtual DOM. Additionally, it directly re-renders the entire
 * component tree on every update, which may lead to performance inefficiencies in complex
 * applications.
 */
export const render =
  (hooks) =>
  (component = _component, root = _root) => {
    while (root.firstChild) {
      root.removeChild(root.firstChild);
    }

    const rootComponent = reconcile(component, root);
    _hooks = hooks;
    _component = component;
    _root = root;

    const dom = createDom(rootComponent);
    root.appendChild(dom);
  };

/**
 * @function reconcile
 * @description A custom function that emulates React's reconciliation process.
 * @param {Object|Array} component - The component or component hierarchy to reconcile.
 * @param {HTMLElement} root - The root element for attaching the DOM representation.
 * @returns {Object|Array} - The reconciled component hierarchy for rendering.
 *
 * The `reconcile` function simulates React's reconciliation process, which aims to create
 * an updated and structured representation of the component hierarchy. It plays a key role
 * in efficiently determining changes in the virtual component tree and updating the DOM.
 *
 * This function takes the `component` to reconcile and the target `root` element. It first
 * extracts the `type` property from the component to determine its type. If the component
 * is an array, it recursively processes each child component and returns a mapped array of
 * reconciled child components. If the component's type is a string, it indicates a primitive
 * DOM element. Otherwise, the `type` function is invoked to generate the actual function component.
 * The function iterates through the children of the component, recursively reconciling
 * non-primitive components and their children.
 *
 * The `reconcile` implementation covers the core aspect of reconciling component hierarchies
 * and managing nested components. However, it lacks optimizations and advanced
 * features present in React's official reconciliation process. For instance, it doesn't handle
 * key-based optimizations or more complex diffing strategies that optimize rendering and
 * improve performance.
 */
const reconcile = (component, root) => {
  const { type } = component;

  if (Array.isArray(component)) {
    return component.map((childComponent) => reconcile(childComponent, root));
  }

  const comp = typeof type === 'string' ? component : type();

  if (comp?.props && comp?.props?.children) {
    comp.props.children.forEach((child, i) => {
      if (typeof child.type !== 'string') {
        comp.props.children[i] = reconcile(comp.props.children[i], root);
      }
    });
  }

  return comp;
};

/**
 * @function createDom
 * @description A custom function that emulates creating and updating DOM elements.
 * @param {Object} fiber - The component fiber representing the element to create.
 * @returns {HTMLElement|Text} - The generated DOM element or text node.
 *
 * The `createDom` function replicates the process of creating and updating DOM elements
 * based on the component fiber representation. It plays a crucial role in generating the
 * actual DOM structure to reflect the virtual component hierarchy.
 *
 * This function takes a `fiber` object representing a component (that has created in the `reconcile` function).
 * It determines the type of element to create based on the `fiber.type` property. If the type is `'TEXT_NODE'`, it
 * creates a text node; otherwise, it creates a DOM element with the specified type. The
 * function then extracts the `props` from the fiber and uses the `updateDom` function to
 * apply property updates to the element. If the component has children, the function iterates
 * through them, recursively creating and appending child DOM elements as necessary.
 */
const createDom = (fiber) => {
  if (fiber === null) {
    return document.createElement('div');
  }

  if (typeof fiber.type === 'function') {
    const childElement = fiber.type(fiber.props);
    return createDom(childElement);
  }

  const dom = fiber?.type === 'TEXT_NODE' ? document.createTextNode('') : document.createElement(fiber?.type);
  const props = fiber?.props ?? {};

  updateDom(dom, {}, props);

  if (props.children) {
    props.children.forEach((element) => {
      if (Array.isArray(element)) {
        element.forEach((child) => {
          dom.appendChild(createDom(child));
        });
      } else {
        dom.appendChild(createDom(element));
      }
    });
  }

  return dom;
};

/**
 * @function updateDom
 * @description A custom function to update DOM elements based on property changes.
 * @param {HTMLElement} dom - The DOM element to update.
 * @param {Object} prevProps - The previous properties of the element.
 * @param {Object} nextProps - The next properties to update the element.
 *
 * The `updateDom` function mimics React's process of updating DOM elements based on property
 * changes. It is responsible for synchronizing the DOM with the latest component props,
 * attributes, and event listeners, ensuring a consistent view of the UI.
 *
 * This function takes a `dom` element and the previous and next sets of properties (`prevProps`
 * and `nextProps`). It follows a sequence of steps to handle property updates:
 * - It removes event listeners for any event attributes present in `prevProps` but missing
 *   in `nextProps`, ensuring clean removal of previous event listeners.
 * - It clears property values for properties that exist in `prevProps` but are missing in
 *   `nextProps`, effectively reverting to default values.
 * - It sets property values in `dom` for properties that are present in `nextProps` but were
 *   not in `prevProps`, applying new attribute values.
 * - It attaches event listeners for event attributes that are present in both `prevProps` and
 *   `nextProps`, but have changed values.
 */
const updateDom = (dom, prevProps, nextProps) => {
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });

  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = '';
    });

  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = nextProps[name];
    });

  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name]);
    });
};
