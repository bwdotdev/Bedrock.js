class OpenConnectionRequestTwo {

  constructor(byteBuffer) {
    byteBuffer.offset = 22 // Magic & Security
    this.port = byteBuffer.readShort()
    this.mtuSize = byteBuffer.readShort()
    this.cid = byteBuffer.readLong()
  }

}

module.exports = OpenConnectionRequestTwo