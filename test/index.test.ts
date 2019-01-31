import { configure } from 'mobx'
import localstorage from '../src'

configure({ enforceActions: 'always' })

describe('enforceActions: always', () => {
  it('set should work fine', () => {
    localstorage.setItem('a', 'b')
    localstorage.set('a', 'b')
  })

  it('delete should work fine', () => {
    localstorage.removeItem('a')
    localstorage.delete('a')
  })

  it('clear should work fine', () => {
    localstorage.clear()
  })
})
