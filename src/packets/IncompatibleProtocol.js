const ByteBuffer = require('bytebuffer')
const Protocol = require('../Protocol')

class IncompatibleProtocol {

  constructor() {
    this.byteBuffer = new ByteBuffer()
  }

  encode() {
    return this.byteBuffer
      .writeByte(Protocol.INCOMPATIBLE_PROTOCOL)
      .writeByte(Protocol.PROTOCOL_VERSION)
      .append(Protocol.MAGIC, "hex")
      .writeLong(Protocol.SERVER_ID)
      .flip()
      .compact()
  }

}

module.exports = IncompatibleProtocol