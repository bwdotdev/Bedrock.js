const ByteBuffer = require('bytebuffer')

class GamePacket {

  constructor() {
    this.byteBuffer = new ByteBuffer()
    this.reliability = 0
    this.hasSplit = false
    this.messageIndex = 0
    this.orderIndex = 0
    this.orderChannel = 0
    this.splitCount = 0
    this.splitId = 0
    this.splitIndex = 0
  }

}

module.exports = GamePacket
