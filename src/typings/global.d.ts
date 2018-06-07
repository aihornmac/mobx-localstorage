interface Window {
  attachEvent<K extends keyof WindowEventMap>(type: K, listener: (this: Window, ev: WindowEventMap[K]) => any): void
  attachEvent(type: string, listener: EventListenerOrEventListenerObject): void
}
