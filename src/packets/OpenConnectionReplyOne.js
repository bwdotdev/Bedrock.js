const ByteBuffer = require('bytebuffer')
const Protocol = require('../Protocol')

class OpenConnectionReplyOne {

  constructor(mtuSize) {
    this.mtuSize = mtuSize
    this.byteBuffer = new ByteBuffer()
  }

  encode() {
    return this.byteBuffer
      .writeByte(Protocol.OPEN_CONNECTION_REPLY_1)
      .append(Protocol.MAGIC, "hex")
      .writeLong(Protocol.SERVER_ID)
      .writeByte(0)
      .writeShort(this.mtuSize)
      .flip()
      .compact()
  }

}

module.exports = OpenConnectionReplyOne