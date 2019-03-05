import reactiveLocalStorage from 'reactive-localstorage'
import mobxLocalStorage from '../src'

inject(window)

function inject(window: any) {
  window.reactiveLocalStorage = reactiveLocalStorage
  window.mobxLocalStorage = mobxLocalStorage
}
