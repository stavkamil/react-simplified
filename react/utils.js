const isEvent = (key) => key.startsWith('on');
const isNew = (prev, next) => (key) => prev[key] !== next[key];
const isProperty = (key) => key !== 'children' && !isEvent(key);
const isGone = (_, next) => (key) => !(key in next);

export { isEvent, isNew, isProperty, isGone };
