const { ObservableMap, toJS } = require('mobx');

const ENV = typeof window !== 'undefined' ? window : (
  typeof global !== 'undefined' ? global : undefined
);

if (!ENV) {
  throw new Error('unknown environment');
}

if ('localStorage' in ENV) {
  module.exports = asLocalStorage();
} else {
  console.error(`You environment doesn't support localStorage`); // eslint-disable-line no-console
}

function asLocalStorage () {
  listen(({ key, newValue, oldValue }) => {
    feed(key, newValue, oldValue);
  });

  const store = new ObservableMap(cloneLocalStorage());

  class LocalStorage {
    get length () {
      return localStorage.length;
    }

    getItem (key) {
      return this.get(key);
    }

    setItem (key, value) {
      return this.set(key, value);
    }

    removeItem (key) {
      return this.delete(key);
    }

    clear () {
      localStorage.clear();
      store.clear();
    }

    has (key) {
      return store.has(key);
    }

    get (key) {
      return store.get(key);
    }

    set (key, value) {
      const json = JSON.stringify(
        toJS(value)
      );
      localStorage.setItem(key, json);
      store.set(key, value);
    }

    delete (key) {
      localStorage.removeItem(key);
      store.delete(key);
    }

    keys () {
      return store.keys();
    }

    values () {
      return store.values();
    }

    entries () {
      return store.entries();
    }

    forEach (...args) {
      return store.forEach(...args);
    }

    get size () {
      return store.size;
    }
  }

  return new LocalStorage();

  function feed (key, newValue, oldValue) {
    if (newValue === null) {
      if (oldValue === null) {
        console.warn(`localStorage: unexpected event type`); // eslint-disable-line no-console
      } else {
        store.delete(key);
      }
    } else {
      store.set(key, parseValue(newValue));
    }
  }
}

function listen (cb) {
  if (ENV.addEventListener) {
    ENV.addEventListener('storage', cb, true);
  } else if (ENV.attachEvent) {
    ENV.attachEvent('storage', cb);
  } else {
    console.error(`You environment doesn't support event listener`); // eslint-disable-line no-console
  }
}

function cloneLocalStorage () {
  const state = {};
  const len = localStorage.length;
  for (let i = 0; i < len; i++) {
    const key = localStorage.key(i);
    state[key] = parseValue(
      localStorage.getItem(key)
    );
  }
  return state;
}

function parseValue (value) {
  try {
    return JSON.parse(value);
  } catch (e) {
    // ignore if cannot parse as JSON
  }
  return value;
}
