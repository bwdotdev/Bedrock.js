class ConnectionRequest {

  constructor(byteBuffer) {
    byteBuffer.reset()
    byteBuffer.skip(2)
    console.log(byteBuffer.buffer)
    console.log('offset', byteBuffer.buffer[0], byteBuffer.offset)
    this.cid = byteBuffer.readLong()
    // this.session = byteBuffer.readLong()
    // this.unknown = byteBuffer.readByte()
    this.time = byteBuffer.readLong()
    // this.securityEnabled = byteBuffer.readByte() !== 0x00
  }

}

module.exports = ConnectionRequest