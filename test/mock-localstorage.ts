inject(global)

function inject(global: any) {
  const keys = Symbol('keys')
  const storage = Symbol('storage')
  class MockStorage implements Storage {
    private [keys]: string[] = []
    private [storage] = new Map<string, string | null>()

    get length() {
      return this[storage].size
    }

    key(index: number): string | null {
      const key = this[keys][index]
      return typeof key === 'string' ? key : null
    }

    getItem(key: string): string | null {
      const map = this[storage]
      if (map.has(key)) return map.get(key)!
      return null
    }

    setItem(key: string, value: string): void {
      key = String(key)
      if (typeof this[key] === 'string') {
        value = String(value)
        this[key] = value
      }
      if (!this[storage].has(key)) {
        this[keys].push(key)
      }
      this[storage].set(key, value)
    }

    removeItem(key: string): void {
      key = String(key)
      if (typeof this[key] === 'string') {
        delete this[key]
      }
      if (this[storage].has(key)) {
        const list = this[keys]
        const len = list.length
        for (let i = 0; i < len; i++) {
          if (list[i] === key) {
            list.splice(i, 1)
            break
          }
        }
      }
      this[storage].delete(key)
    }

    clear() {
      for (const key of this[keys]) {
        if (typeof this[key] === 'string') {
          delete this[key]
        }
      }
      this[keys] = []
      this[storage].clear()
    }
  }
  global.Storage = MockStorage
  global.localStorage = new MockStorage()
}
