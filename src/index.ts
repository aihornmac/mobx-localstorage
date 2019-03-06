import { toJS, observable, action, createAtom, IObservableValue } from 'mobx'
import localStorage from 'reactive-localstorage'

export class LocalStorage implements Map<string, any>, Storage {
  [Symbol.toStringTag] = 'Map' as 'Map'

  private _keyBoxes = new Map<string, IObservableValue<boolean>>()
  private _valueBoxes = new Map<string, IObservableValue<any>>()
  private _keys = new Set<string>()

  private _keysAtom = createAtom('mobx storage keys')
  private _is_all_keys_observed = false

  constructor() {
    localStorage.on('change', action((key: string, value: string | null) => {
      if (typeof value === 'string') {
        this._set(key, value)
      } else {
        this._delete(key)
      }
    }))
  }

  get length() {
    return this.size
  }

  get size() {
    this._keysAtom.reportObserved()
    this._syncAllKeys()
    return this._keys.size
  }

  key(index: number) {
    return localStorage.key(index)
  }

  getItem(key: string) {
    return this.get(key)
  }

  setItem(key: string, value: any) {
    this.set(key, value)
  }

  removeItem(key: string) {
    this.delete(key)
  }

  @action
  clear() {
    this._keysAtom.reportChanged()
    localStorage.clear()
    this._keys.clear()
    for (const box of this._keyBoxes.values()) {
      box.set(false)
    }
    for (const box of this._valueBoxes.values()) {
      box.set(null)
    }
  }

  has(key: string) {
    return this._get_key_box(key).get()
  }

  get(key: string) {
    return this._get_value_box(key).get()
  }

  @action
  set(key: string, value?: any) {
    localStorage.setItem(key, JSON.stringify(toJS(value)))
    return this
  }

  @action
  delete(key: string) {
    const has = (
      this._is_all_keys_observed
        ? this._keys.has(key)
        : typeof localStorage.getItem(key) === 'string'
    )
    localStorage.removeItem(key)
    return has
  }

  keys() {
    this._keysAtom.reportObserved()
    this._syncAllKeys()
    return this._keys.values()
  }

  * values() {
    for (const key of this.keys()) {
      yield this._get_value_box(key).get()
    }
  }

  * entries() {
    for (const key of this.keys()) {
      yield [key, this._get_value_box(key).get()] as [string, any]
    }
  }

  [Symbol.iterator]() {
    return this.entries()
  }

  forEach<C>(callbackfn: (this: C, value: any, key: string, map: LocalStorage) => void, thisArg: C): void
  forEach(callbackfn: (value: any, key: string, map: LocalStorage) => void, thisArg?: any): void
  forEach(callbackfn: (value: any, key: string, map: LocalStorage) => void, thisArg?: any) {
    this._keysAtom.reportChanged()
    this._syncAllKeys()
    for (const [key, value] of this.entries()) {
      callbackfn.call(thisArg, value, key, this)
    }
  }

  private _set(key: string, value: string | null) {
    this._keysAtom.reportChanged()
    this._keys.add(key)
    const keyBox = this._keyBoxes.get(key)
    if (keyBox) {
      keyBox.set(true)
    }
    const valueBox = this._valueBoxes.get(key)
    if (valueBox) {
      valueBox.set(parseValue(value))
    }
  }

  private _delete(key: string) {
    this._keysAtom.reportChanged()
    this._keys.delete(key)
    const keyBox = this._keyBoxes.get(key)
    if (keyBox) {
      keyBox.set(false)
    }
    const valueBox = this._valueBoxes.get(key)
    if (valueBox) {
      valueBox.set(null)
    }
  }

  private _get_key_box(key: string) {
    const boxes = this._keyBoxes
    let box = boxes.get(key)
    if (!box) {
      const value = (
        this._is_all_keys_observed
          ? false
          : typeof localStorage.getItem(key) === 'string'
      )
      box = observable.box(value)
    }
    return box
  }

  private _get_value_box(key: string) {
    const boxes = this._valueBoxes
    let box = boxes.get(key)
    if (!box) {
      const value = this._is_all_keys_observed ? null : localStorage.getItem(key)
      box = observable.box(parseValue(value))
    }
    return box
  }

  private _syncAllKeys() {
    if (this._is_all_keys_observed) return
    this._is_all_keys_observed = true
    const len = localStorage.length
    const boxes = this._keyBoxes
    const keys = this._keys
    keys.clear()
    for (let i = 0; i < len; i++) {
      const key = localStorage.key(i)
      if (typeof key !== 'string') continue
      keys.add(key)
      if (boxes.has(key)) continue
      boxes.set(key, observable.box(true))
    }
  }
}

export function parseValue(value: any) {
  try {
    return JSON.parse(value)
  } catch (e) {
    // ignore if cannot parse as JSON
  }
  return value
}

export default new LocalStorage()
