const ByteBuffer = require('bytebuffer')
const EncapsulatedPacket = require('../Packets/EncapsulatedPacket')
const Protocol = require('../Protocol')

class ConnectionRequestAccepted {

  constructor(port, time, address) {
    this.port = port
    // this.session = session

    this.time = time
    this.address = address
  }

  encode() {
    const byteBuffer = new ByteBuffer()
    byteBuffer.writeByte(Protocol.CONNECTION_REQUEST_ACCEPTED)
    EncapsulatedPacket.writeAddress(byteBuffer, this.address, this.port)
    byteBuffer.writeShort(0)

    EncapsulatedPacket.writeAddress(byteBuffer, '127.0.0.1', 0)
    for(let i = 0; i < 19; i++) {
      EncapsulatedPacket.writeAddress(byteBuffer, '0.0.0.0', 0)
    }

    return byteBuffer
      .writeLong(this.time)
      .writeLong(+ new Date())
  }

  encodeoff() {
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

module.exports = ConnectionRequestAccepted