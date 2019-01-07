import Packet from "@/Packet"
import { BinaryStream } from "@/utils";
import Reliability from "@/Reliability";

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

  constructor(packetId: number, stream?: BinaryStream) {
    super(packetId, stream)

    if (stream) {
      const flags = stream.readByte()
      this.reliability = ((flags & 0xe0) >> 5)
      this.hasSplit = (flags & 0x10) > 0

      this.length = Math.ceil(stream.readShort() / 8)

      if (this.isReliable()) {
        this.messageIndex = stream.readLTriad()
      }

      if (this.isSequenced()) {
        this.orderIndex = stream.readLTriad()
        this.orderChannel = stream.readByte()
      }

      if(this.hasSplit) {
        this.splitCount = stream.readInt()
        this.splitId = stream.readShort()
        this.splitIndex = stream.readInt()
      }
    }
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

}