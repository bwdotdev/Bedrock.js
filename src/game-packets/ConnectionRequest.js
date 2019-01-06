const Long = require('long')
const ByteBuffer = require('bytebuffer')

const EncapsulatedPacket = require('../packets/EncapsulatedPacket')

class ConnectionRequest {

  constructor(byteBuffer) {
    byteBuffer.reset()
    byteBuffer.skip(1)
    
    this.cid = byteBuffer.readLong()
    this.time = byteBuffer.readLong()
    this.hasSecurity = byteBuffer.readByte() !== 0x00
  }

}

module.exports = ConnectionRequest