const ByteBuffer = require('bytebuffer')
const Protocol = require('../Protocol')

class OpenConnectionReplyTwo {

  constructor(port, mtuSize) {
    this.port = port
    this.mtuSize = mtuSize
  }

  encode() {
    const byteBuffer = new ByteBuffer()
    return byteBuffer
      .writeByte(Protocol.OPEN_CONNECTION_REPLY_2)
      .append(Protocol.MAGIC, "hex")
      .writeLong(Protocol.SERVER_ID)
      .writeShort(this.port)
      .writeShort(this.mtuSize)
      .writeByte(0)
      .flip()
      .compact()
  }

}

module.exports = OpenConnectionReplyTwo