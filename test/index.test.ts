import { expect } from 'chai'
import { configure, toJS } from 'mobx'
import rls from 'reactive-localstorage'
import * as uuidv4 from 'uuid/v4'
import localstorage, { parseValue, stringifyValue } from '../src'

configure({ enforceActions: 'always' })

describe('enforceActions: always', () => {
  it('feeds should work fine', () => {
    rls.feed('a', uuidv4())

    expect(localstorage.has('a')).to.be.true
  })

  it('set should work fine', () => {
    const id1 = uuidv4()
    const id2 = uuidv4()
    localstorage.setItem('a', id1)
    localstorage.set('a', id2)

    expect(id1).to.not.equal(id2)
    expect(localstorage.getItem('a')).to.equal(id2)
    expect(localstorage.getItem('a')).to.equal(localstorage.get('a'))
  })

  it('delete should work fine', () => {
    localstorage.removeItem('a')
    localstorage.delete('a')

    expect(localstorage.has('a')).to.be.false
    expect(localstorage.get('a')).to.be.undefined
    expect(localstorage.getItem('a')).to.be.null
  })

  it('clear should work fine', () => {
    localstorage.clear()

    expect(localstorage.length).to.equal(0)
  })

  it('configure should work fine', () => {
    const key = uuidv4()
    localstorage.setItem(key, {})

    expect(localstorage.get(key)).to.deep.equal({})

    localstorage.configure({
      parser: x => x,
      stringify: x => String(x),
    })
    try {
      expect(localstorage.get(key)).to.deep.equal('{}')
    } finally {
      localstorage.configure({
        parser: parseValue,
        stringify: stringifyValue,
      })
      expect(localstorage.get(key)).to.deep.equal({})
    }
  })
})
