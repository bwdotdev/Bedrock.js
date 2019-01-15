import AcknowledgePacket from "./AcknowledgePacket"
import Protocol from "@/Protocol"

export default class NAK extends AcknowledgePacket {

  constructor(ids: number[] = []) {
    super(Protocol.NAK, ids)
  }

}