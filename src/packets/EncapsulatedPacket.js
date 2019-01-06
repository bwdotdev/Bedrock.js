const ByteBuffer = require('bytebuffer')
const GamePacket = require('./GamePacket')
const Protocol = require('../Protocol')

class EncapsulatedPacket {

  constructor(byteBuffer) {
    this.RELIABILITY_SHIFT = 5
    this.RELIABILITY_FLAGS = 0b111 << EncapsulatedPacket.RELIABILITY_SHIFT

    this.SPLIT_FLAG = 0b00010000

    if (byteBuffer instanceof ByteBuffer) {
      this.packets = []
      this.id = byteBuffer.readByte()
      this.decode(byteBuffer)
    } else {
      this.packets = byteBuffer
      this.id = Protocol.DATA_PACKET_4
      this.sequenceNumber = 0
    }
  }

  decode(byteBuffer) {
    byteBuffer.reset()
    byteBuffer.buffer[0] = 0x00
    this.sequenceNumber = byteBuffer.readUint32()

    while (byteBuffer.remaining() > 0) {
      const pk = new GamePacket()
      const flag = byteBuffer.readByte()
      pk.reliability = (flag >> 5)
      pk.hasSplit = (flag & 16) === 16
      const length = byteBuffer.readUint16() / 8

      if (pk.reliability == 2 || pk.reliability == 3 || pk.reliability == 4 || pk.reliability == 6 || pk.reliability == 7) {
        pk.messageIndex = EncapsulatedPacket.readLTriad(byteBuffer.buffer, byteBuffer.offset);
        byteBuffer.skip(3);
      }
      if (pk.reliability == 1 || pk.reliability == 3 || pk.reliability == 4 || pk.reliability == 7) {
        pk.orderIndex = EncapsulatedPacket.readLTriad(byteBuffer.buffer, byteBuffer.offset);
        byteBuffer.skip(3);
        pk.orderChannel = byteBuffer.readByte();
      }
      if (pk.hasSplit) {
        pk.splitCount = byteBuffer.readInt();
        pk.splitId = byteBuffer.readShort();
        pk.splitIndex = byteBuffer.readInt();
      }
      // pk.byteBuffer = byteBuffer.copy(byteBuffer.offset, byteBuffer.offset + length);
      this.packets.push(byteBuffer.copy(byteBuffer.offset, byteBuffer.offset + length));
      byteBuffer.skip(length);
    }
  }

  encode() {
    let byteBuffer = new ByteBuffer()

    if(this.packets.length) {
      byteBuffer.writeByte(this.id)
      byteBuffer.flip()
      byteBuffer = ByteBuffer.concat([byteBuffer, EncapsulatedPacket.writeLTriad(this.sequenceNumber)])
      byteBuffer.offset = byteBuffer.limit

      this.packets.forEach(packet => {
        if(!packet.reliability) packet.reliability = 0
        if(!packet.hasSplit) packet.hasSplit = false

        const packetBuffer = packet.encode()

        byteBuffer.writeByte((packet.reliability << 5) ^ (packet.hasSplit ? true : 0x00))
        byteBuffer.writeShort(packetBuffer.limit << 3)

        if([2, 3, 4, 6, 7].includes(packet.reliability)) {
          byteBuffer.flip()
          byteBuffer = ByteBuffer.concat([byteBuffer, EncapsulatedPacket.writeLTriad(packet.messageIndex)])
          byteBuffer.offset = byteBuffer.limit
        }

        if([1, 3, 4, 7].includes(packet.reliability)) {
          byteBuffer.flip()
          byteBuffer = ByteBuffer.concat([byteBuffer, EncapsulatedPacket.writeLTriad(packet.orderIndex)])
          byteBuffer.offset = byteBuffer.limit
          byteBuffer.writeByte(packet.orderChannel)
        }

        if(packet.hasSplit) {
          byteBuffer.writeInt(packet.splitCount)
          byteBuffer.writeShort(packet.splitId)
          byteBuffer.writeInt(packet.splitIndex)
        }

        byteBuffer = ByteBuffer.concat([byteBuffer.reset(), packetBuffer])
        byteBuffer.offset = byteBuffer.limit
      })
    }

    return byteBuffer
  }

  static readLTriad(data, offset) {
    return (data[offset++] | data[offset++] << 8 | data[offset] << 16);
  }

  static writeLTriad(data) {
    const buf = new ByteBuffer();
    buf.writeUint32(data);
    return buf.copy(1, 4);
  }

  static writeAddress(byteBuffer, addr, port) {
    byteBuffer.writeByte(4) // IPV4
    const parts = addr.split('.')
    parts.forEach(part => {
      byteBuffer.writeByte(~part & 0xff)
    })
    if(port) byteBuffer.writeShort(port)
  }

}

module.exports = EncapsulatedPacket