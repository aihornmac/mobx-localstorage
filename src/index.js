const { observable, action, map, toJS } = require('mobx');

class LocalStorage {
  @observable _state = map(cloneLocalStorage());
  @observable _listeners = [];

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
    this._state.clear();
  }

  has (key) {
    return this._state.has(key);
  }

  get (key) {
    return this._state.get(key);
  }

  set (key, value) {
    const json = JSON.stringify(
      toJS(value)
    );
    localStorage.setItem(key, json);
    this._state.set(key, value);
  }

  delete (key) {
    localStorage.removeItem(key);
    this._state.delete(key);
  }

  keys () {
    return this._state.keys();
  }

  values () {
    return this._state.values();
  }

  entries () {
    return this._state.entries();
  }

  forEach (...args) {
    return this._state.forEach(...args);
  }

  get size () {
    return this._state.size;
  }

  toJS () {
    return this._state.toJS();
  }

  @action _feed (key, newValue, oldValue) {
    const state = this._state;
    if (newValue === null) {
      if (oldValue === null) {
        console.warn(`localStorage: unexpected event type`); // eslint-disable-line
      } else {
        state.delete(key);
      }
    } else {
      state.set(key, parseValue(newValue));
    }
  }

  constructor () {
    if ('localStorage' in window) {
      listen(({ key, newValue, oldValue }) => {
        this._feed(key, newValue, oldValue);
      });
    } else {
      throw new Error(`You browser doesn't support localStorage`); // eslint-disable-line
    }
  }
}

module.exports = new LocalStorage();

function listen (cb) {
  if (window.addEventListener) {
    window.addEventListener('storage', cb, true);
  } else {
    window.attachEvent('storage', cb);
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
