import AcknowledgePacket from "./AcknowledgePacket"
import Protocol from "@/Protocol"
import { BinaryStream } from "@/utils"

export default class NAK extends AcknowledgePacket {

  constructor(stream?: BinaryStream) {
    super(Protocol.NAK)

    if(stream) {
      const count = stream.readShort()
      console.log('COUNT', count)
      let cnt = 0

      for(let i = 0; i < count && !stream.feof() && cnt < 4096; i++) {
        if(stream.readByte() === 0) {
          const start = stream.readLTriad()
          let end = stream.readLTriad()
          if((end - start) > 512) {
            end = start + 512
          }
          for(let c = start; c <= end; c++) {
            this.ids.push(c)
            cnt++
          }
        } else {
          this.ids.push(stream.readLTriad())
          cnt++
        }
      }
    }
  }

}