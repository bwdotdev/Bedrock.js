import Server from '@/Server'
import assert from 'assert'

describe('Server', () => {
  describe('#getName', () => {
    const name = 'B.js Tests'
    it(`should equal '${name}'`, () => {
      const s = new Server({ name })

      assert.equal(s.getName(), name)

      s.close()
    })
  })
  describe('#getMaxPlayers', () => {
    const maxPlayers = 5
    const name = 'B.js Tests'
    it(`should equal '${maxPlayers}'`, () => {
      const s = new Server({ name, maxPlayers })

      assert.equal(s.getMaxPlayers(), maxPlayers)

      s.close()
    })
  })
})
