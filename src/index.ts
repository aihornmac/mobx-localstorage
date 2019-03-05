import { ObservableMap, toJS, observable, action } from 'mobx'
import localStorage from 'reactive-localstorage'

const referenceEnhancer = observable.map({}, { deep: false }).enhancer

export class LocalStorage extends ObservableMap<string> implements Storage {
  constructor() {
    super(undefined, referenceEnhancer, 'LocalStorage')
    const len = localStorage.length
    for (let i = 0; i < len; i++) {
      const key = localStorage.key(i)!
      const value = parseValue(localStorage.getItem(key))
      super.set(key, value)
    }
    localStorage.on('change', action((key: string, value: string | null) => {
      if (typeof value === 'string') {
        super.set(key, parseValue(value))
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
    localStorage.setItem(key, JSON.stringify(toJS(value)))
    return this
  }

  @action
  delete(key: string) {
    const has = super.has(key)
    localStorage.removeItem(key)
    return has
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
