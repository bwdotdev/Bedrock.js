const ByteBuffer = require('bytebuffer')
const Protocol = require('../Protocol')

class IncompatibleProtocol {

  constructor() {
    this.byteBuffer = new ByteBuffer()
    this.byteBuffer.buffer[0] = Protocol.INCOMPATIBLE_PROTOCOL;
    this.byteBuffer.offset = 1;
  }

  encode() {
    return this.byteBuffer
      .writeByte(Protocol.PROTOCOL_VERSION)
      .append(Protocol.MAGIC, "hex")
      .writeLong(Protocol.SERVER_ID)
      .flip()
      .compact();
  }

}

module.exports = IncompatibleProtocol