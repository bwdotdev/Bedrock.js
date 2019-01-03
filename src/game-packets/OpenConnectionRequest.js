class OpenConnectionRequest {

  constructor(byteBuffer) {
    byteBuffer.skip(1)
    this.cid = byteBuffer.readLong()
    this.session = byteBuffer.readLong()
    // this.unknown = byteBuffer.readByte()
  }

}

module.exports = OpenConnectionRequest