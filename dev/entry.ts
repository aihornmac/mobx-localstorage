import * as mobx from 'mobx'
import reactiveLocalStorage from 'reactive-localstorage'
import mobxLocalStorage from '../src'

inject(window)

function inject(window: any) {
  window.mobx = mobx
  window.reactiveLocalStorage = reactiveLocalStorage
  window.mobxLocalStorage = mobxLocalStorage
}
