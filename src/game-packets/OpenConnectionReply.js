const ByteBuffer = require('bytebuffer')
const EncapsulatedPacket = require('../Packets/EncapsulatedPacket')
const Protocol = require('../Protocol')

class OpenConnectionReply {

  constructor(port, session) {
    this.port = port
    this.session = session
  }

  encode() {
    let byteBuffer = new ByteBuffer()
    byteBuffer.writeByte(Protocol.OPEN_CONNECTION_REPLY)
    byteBuffer = ByteBuffer.concat([byteBuffer.reset(), [0x04, 0x3f, 0x57, 0xfe]])
    byteBuffer
      .writeByte(0xcd)
      .writeShort(this.port)
      .flip()
    byteBuffer = ByteBuffer.concat([byteBuffer.reset(), EncapsulatedPacket.writeLTriad(4)])
    byteBuffer.offset = byteBuffer.limit
    byteBuffer.flip()
    byteBuffer = ByteBuffer.concat([byteBuffer.reset(), [0xf5, 0xff, 0xff, 0xf5]])
    byteBuffer.offset = byteBuffer.limit

    for(let i = 0; i < 9; i++) {
      byteBuffer.flip()
      byteBuffer = ByteBuffer.concat([byteBuffer.reset(), EncapsulatedPacket.writeLTriad(4)])
      byteBuffer.offset = byteBuffer.limit
      byteBuffer.flip()
      byteBuffer = ByteBuffer.concat([byteBuffer.reset(), [0xff, 0xff, 0xff, 0xff]])
      byteBuffer.offset = byteBuffer.limit
    }

    byteBuffer.flip()
    byteBuffer = ByteBuffer.concat([byteBuffer, [0x00, 0x00]])
    byteBuffer.offset = byteBuffer.limit

    byteBuffer.writeLong(this.session)

    byteBuffer.flip()
    byteBuffer = ByteBuffer.concat([byteBuffer.reset(), [0x00, 0x00, 0x00, 0x00, 0x04, 0x44, 0x0b, 0xa9]])
    return byteBuffer.compact()
  }

}

module.exports = OpenConnectionReply