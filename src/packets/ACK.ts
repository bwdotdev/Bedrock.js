import AcknowledgePacket from "./AcknowledgePacket"
import Protocol from "@/Protocol"

export default class ACK extends AcknowledgePacket {

  constructor(ids: number[] = []) {
    super(Protocol.ACK, ids)
  }

}