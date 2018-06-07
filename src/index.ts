import { ObservableMap, toJS, observable } from 'mobx'

const ENV = typeof window !== 'undefined' ? window : (
  typeof global !== 'undefined' ? global : undefined
) as typeof window | undefined

if (!ENV) {
  throw new Error('unknown environment')
}

if (process.env.NODE_ENV !== 'production') {
  if ('localStorage' in ENV) {
    console.warn(`You environment doesn't support localStorage`)
  }
}

const localStorage = (ENV as any).localStorage as Storage

const referenceEnhancer = observable.map({}, { deep: false }).enhancer

export class LocalStorage extends ObservableMap<any> implements Storage {
  namespace = ''

  constructor() {
    super(cloneLocalStorage(), referenceEnhancer, 'LocalStorage')

    listen(({ key, newValue, oldValue }) => {
      feed(this, key, newValue, oldValue)
    })

    this.bind = this.bind.bind(this)
  }

  bind(namespace?: string): PropertyDecorator
  bind(target: {}, key: string): void
  bind(...args: any[]) {
    const ns = this.namespace
    if (args.length < 2) {
      return makeSyncLocalstorage(this, args[0] ? `${ns} ${args[0]}` : ns)
    }
    return makeSyncLocalstorage(this, ns)(args[0], args[1])
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
    localStorage.setItem(key, value)
    super.set(key, value)
  }

  removeItem(key: string) {
    return super.delete(key)
  }

  clear() {
    localStorage.clear()
    super.clear()
  }

  set(key: string, value?: any) {
    const json = JSON.stringify(toJS(value))
    localStorage.setItem(key, json)
    super.set(key, value)
    return this
  }

  delete(key: string) {
    localStorage.removeItem(key)
    return super.delete(key)
  }
}

export function feed(store: ObservableMap<any>, key: string | null, newValue: any, oldValue: any) {
  if (!key) return
  if (newValue === null) {
    if (oldValue === null) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`localStorage: unexpected event type`)
      }
    } else {
      store.delete(key)
    }
  } else {
    store.set(key, parseValue(newValue))
  }
}

export function listen(cb: (this: Window, ev: WindowEventMap['storage']) => any) {
  if (ENV) {
    if (ENV.addEventListener) {
      ENV.addEventListener('storage', cb, true)
    } else if ((ENV as any).attachEvent) {
      ENV.attachEvent('storage', cb)
    } else {
      console.warn(`You environment doesn't support event listener`)
    }
  } else {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`You environment doesn't support localStorage`)
    }
  }
}

export function cloneLocalStorage() {
  const state: { [key: string]: any } = {}
  const len = localStorage.length
  for (let i = 0; i < len; i++) {
    const key = localStorage.key(i)!
    state[key] = parseValue(
      localStorage.getItem(key)
    )
  }
  return state
}

export function parseValue(value: any) {
  try {
    return JSON.parse(value)
  } catch (e) {
    // ignore if cannot parse as JSON
  }
  return value
}

export function makeSyncLocalstorage(localstorage: LocalStorage, namespace: string) {
  return function syncLocalstorage(target: {}, key: string) {
    const descriptor = Object.getOwnPropertyDescriptor(target, key) || {}
    delete descriptor.value
    const itemKey = `${namespace} ${key}`
    Object.defineProperty(target, key, {
      ...descriptor,
      get(this: any) {
        return localstorage.getItem(itemKey)
      },
      set(this: any, value: any) {
        const map = getInitializedMap(this)
        if (!map[key]) {
          map[key] = true
          if (localstorage.has(itemKey)) return
        }
        localstorage.setItem(itemKey, value)
      },
    })
  }
}

export function getInitializedMap(target: any) {
  return target.__mobx_localstorage || (target.__mobx_localstorage = {})
}

export default new LocalStorage()
