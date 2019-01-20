import AcknowledgePacket from "./AcknowledgePacket"
import Protocol from "@/network/raknet/Protocol"
import { BinaryStream } from "@/utils"

export default class ACK extends AcknowledgePacket {

  constructor(stream?: BinaryStream) {
    super(Protocol.ACK, stream)
  }

}