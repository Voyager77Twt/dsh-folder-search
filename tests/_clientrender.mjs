import { loadSettings } from "../lib/settings-store.js";
const settings = await loadSettings();
let factory = null;
globalThis.window = { __ModuleLoader__: { load(spec) { factory = spec.factory; } } };
let registered = null;
const React = {
  createElement(type, props, ...children) { return { type, props: props || {}, children }; },
  useState(initial) {
    const values = [settings, null, '', false, ''];
    const index = React._hook = (React._hook ?? -1) + 1;
    return [values[index] ?? initial, () => {}];
  },
  useEffect() {},
  useCallback(fn) { return fn; },
  useMemo(fn) { return fn(); },
  Fragment: 'Fragment',
};
await import('../lib/client.js');
const mod = factory((name) => { if (name === 'react') return React; throw new Error('require ' + name); });
const ctx = {
  slots: {
    inject(name, fn) { fn(); },
    register(def, component) { registered = { def, component }; return () => {}; },
  },
};
mod.apply(ctx);
console.log('registered', registered?.def);
try {
  React._hook = -1;
  const tree = registered.component();
  console.log('render ok');
} catch (error) {
  console.error('render error', error && error.stack || error);
}

