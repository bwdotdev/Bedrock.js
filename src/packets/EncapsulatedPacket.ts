import Packet from "@/Packet"
import { BinaryStream } from "@/utils";
import Reliability from "@/Reliability";
import Protocol from "@/Protocol";

export default class EncapsulatedPacket extends Packet {

  public reliability: number = 0

  public length: number = 0

  public messageIndex: number = 0

  public hasSplit: boolean = false
  public splitCount: number = 0
  public splitId: number = 0
  public splitIndex: number = 0

  public orderIndex: number = 0
  public orderChannel: number = 0

  constructor(id: number = Protocol.DATA_PACKET_4) {
    super(id)
  }

  isReliable() {
    return (
      this.reliability === Reliability.Reliable ||
      this.reliability === Reliability.ReliableOrdered ||
      this.reliability === Reliability.ReliableSequenced ||
      this.reliability === Reliability.ReliableACK ||
      this.reliability === Reliability.ReliableOrderedACK
    )
  }

  isSequenced() {
    return (
      this.reliability === Reliability.UnreliableSequenced ||
      this.reliability === Reliability.ReliableOrdered ||
      this.reliability === Reliability.ReliableSequenced ||
      this.reliability === Reliability.ReliableOrderedACK
    )
  }

  static fromBinary(stream: BinaryStream) {
    const packet = new EncapsulatedPacket()

    const flags = stream.readByte()
    packet.reliability = ((flags & 0xe0) >> 5)
    packet.hasSplit = (flags & 0x10) > 0

    packet.length = Math.ceil(stream.readShort() / 8)

    if (packet.isReliable()) {
      packet.messageIndex = stream.readLTriad()
    }

    if (packet.isSequenced()) {
      packet.orderIndex = stream.readLTriad()
      packet.orderChannel = stream.readByte()
    }

    if(packet.hasSplit) {
      packet.splitCount = stream.readInt()
      packet.splitId = stream.readShort()
      packet.splitIndex = stream.readInt()
    }

    console.log('offset', stream.offset, packet.length)
    packet.setStream(new BinaryStream(stream.buffer.slice(stream.offset, stream.offset + packet.length)), true)
    stream.offset += packet.length

    return packet
  }

}