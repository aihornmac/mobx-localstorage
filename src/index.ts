import { ObservableMap, toJS, observable } from 'mobx'
import localStorage from 'reactive-localstorage'

const referenceEnhancer = observable.map({}, { deep: false }).enhancer

export class LocalStorage extends ObservableMap<any> implements Storage {
  constructor() {
    super(undefined, referenceEnhancer, 'LocalStorage')
    const len = localStorage.length
    for (let i = 0; i < len; i++) {
      const key = localStorage.key(i)!
      const value = parseValue(localStorage.getItem(key))
      super.set(key, value)
    }
    localStorage.on('change', (key, value) => {
      if (typeof value === 'string') {
        super.set(key, parseValue(value))
      } else {
        super.delete(key)
      }
    })
  }

  get length() {
    return this.size
  }

  key(index: number) {
    return localStorage.key(index)
  }

  getItem(key: string) {
    return super.get(key)
  }

  setItem(key: string, value: any) {
    this.set(key, value)
  }

  removeItem(key: string) {
    return super.delete(key)
  }

  clear() {
    localStorage.clear()
    super.clear()
  }

  set(key: string, value?: any) {
    localStorage.setItem(key, JSON.stringify(toJS(value)))
    return this
  }

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
