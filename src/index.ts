import { ObservableMap, toJS, observable, action } from 'mobx'
import localStorage from 'reactive-localstorage'

const referenceEnhancer = observable.map({}, { deep: false }).enhancer

export interface LocalStorageConfigure {
  readonly parser?: (data: string | null) => unknown
  readonly stringify?: (data: unknown) => string
}

export class LocalStorage extends ObservableMap<string> implements Storage {
  private _parseValue: (data: string | null) => unknown
  private _stringifyValue: (data: unknown) => string

  constructor() {
    super(undefined, referenceEnhancer, 'LocalStorage')
    this._parseValue = parseValue
    this._stringifyValue = x => JSON.stringify(x)
    this._reload()
    localStorage.on('change', action((key: string, value: string | null) => {
      if (typeof value === 'string') {
        super.set(key, this._parseValue(value))
      } else {
        super.delete(key)
      }
    }))
  }

  get length() {
    return this.size
  }

  key(index: number) {
    return localStorage.key(index)
  }

  getItem(key: string) {
    return super.has(key) ? super.get(key) : null
  }

  setItem(key: string, value: any) {
    this.set(key, value)
  }

  removeItem(key: string) {
    this.delete(key)
  }

  @action
  clear() {
    localStorage.clear()
    super.clear()
  }

  @action
  set(key: string, value?: any) {
    localStorage.setItem(key, this._stringifyValue(value))
    return this
  }

  @action
  delete(key: string) {
    const has = super.has(key)
    localStorage.removeItem(key)
    return has
  }

  @action
  configure(config: LocalStorageConfigure) {
    let changed = false
    if (typeof config.parser === 'function') {
      changed = true
      this._parseValue = config.parser
    }
    if (typeof config.stringify === 'function') {
      changed = true
      this._stringifyValue = config.stringify
    }
    if (changed) {
      this._reload()
    }
  }

  private _reload() {
    const len = localStorage.length
    for (let i = 0; i < len; i++) {
      const key = localStorage.key(i)!
      const value = this._parseValue(localStorage.getItem(key))
      super.set(key, value)
    }
  }
}

export function parseValue(value: string | null) {
  try {
    return value === null ? null : JSON.parse(value)
  } catch (e) {
    // ignore if cannot parse as JSON
  }
  return value
}

export function stringifyValue(value: unknown) {
  return JSON.stringify(toJS(value))
}

export default new LocalStorage()
