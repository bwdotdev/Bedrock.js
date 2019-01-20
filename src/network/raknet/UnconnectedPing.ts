import Packet from "@/network/Packet"
import { BinaryStream } from "@/utils"
import Protocol from "@/network/raknet/Protocol"

export default class UnconnectedPing extends Packet {

  public pingId: number

  constructor(stream: BinaryStream) {
    super(Protocol.UNCONNECTED_PING, stream)

    this.pingId = this.getStream().readLong()
  }

}