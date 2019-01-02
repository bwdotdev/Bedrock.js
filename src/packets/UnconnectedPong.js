const ByteBuffer = require('bytebuffer')
const Protocol = require('../Protocol')

class UnconnectedPong {

  constructor(pingId, name, maxPlayers) {
    this.pingId = pingId
    this.name = name
    this.maxPlayers = maxPlayers
    this.bitStream = new ByteBuffer()
  }

  encode() {
    const name = `MCPE;${this.name};27;1.8.0;0;${this.maxPlayers};0;FunoNetwork`
    return this.bitStream
      .writeByte(Protocol.UNCONNECTED_PONG)
      .writeLong(this.pingId)
      .writeLong(Protocol.SERVER_ID)
      .append(Protocol.MAGIC, "hex")
      .writeShort(name.length)
      .writeString(name)
  }

}

module.exports = UnconnectedPong