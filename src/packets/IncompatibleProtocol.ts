import Packet from "@/Packet"
import Protocol from "@/Protocol"

export default class IncompatibleProtocol extends Packet {

  constructor() {
    super(Protocol.INCOMPATIBLE_PROTOCOL)
  }

  encode() {
    return this.getStream()
      .writeByte(Protocol.PROTOCOL_VERSION)
      .writeMagic()
      .writeLong(Protocol.SERVER_ID)
  }

}
