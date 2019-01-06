const ByteBuffer = require('bytebuffer')
const EncapsulatedPacket = require('../Packets/EncapsulatedPacket')
const Protocol = require('../Protocol')

class ConnectionRequestAccepted {

  constructor(port, pingTime, pongTime, address) {    
    this.port = port
    // this.session = session

    this.pingTime = pingTime
    this.pongTime = pongTime
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
      .writeLong(this.pingTime)
      .writeLong(this.pongTime)
  }

}

module.exports = ConnectionRequestAccepted