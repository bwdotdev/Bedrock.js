import AcknowledgePacket from "./AcknowledgePacket"
import Protocol from "@/Protocol"
import { BinaryStream } from "@/utils"

export default class ACK extends AcknowledgePacket {

  constructor(stream?: BinaryStream) {
    super(Protocol.ACK, stream)
  }

}