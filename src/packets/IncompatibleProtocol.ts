import Packet from "@/Packet"
import Protocol from "@/packets/Protocol"

export default class IncompatibleProtocol extends Packet {

  constructor() {
    super(Protocol.INCOMPATIBLE_PROTOCOL)
  }

  protected encodeBody() {
    return this.getStream()
      .writeByte(Protocol.PROTOCOL_VERSION)
      .writeMagic()
      .writeLong(Protocol.SERVER_ID)
  }

}
