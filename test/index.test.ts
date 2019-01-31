import { configure } from 'mobx'
import rls from 'reactive-localstorage'
import * as uuidv4 from 'uuid/v4'
import localstorage from '../src'

configure({ enforceActions: 'always' })

describe('enforceActions: always', () => {
  it('feeds should work fine', () => {
    rls.feed('a', uuidv4())
  })

  it('set should work fine', () => {
    localstorage.setItem('a', uuidv4())
    localstorage.set('a', uuidv4())
  })

  it('delete should work fine', () => {
    localstorage.removeItem('a')
    localstorage.delete('a')
  })

  it('clear should work fine', () => {
    localstorage.clear()
  })
})
