import Packet from "@/Packet"
import Protocol from "@/Protocol"
import { BinaryStream } from "@/utils"

export default class AcknowledgePacket extends Packet {

  public ids: number[]

  constructor(id: Protocol, ids: number[] = []) {
    super(id)

    this.ids = ids
  }

  protected encodeBody() {
    const stream = new BinaryStream()
    const ids = this.ids.sort((a, b) => a - b)
    let records = 0

    if(ids.length) {
      let start = ids[0]
      let last = ids[0]

      ids.forEach(id => {
        if((id - last) === 1) {
          last = id
        } else if((id - last) > 1) {
          this.add(stream, start, last)

          start = last = id
          records++
        }
      })

      this.add(stream, start, last)
      records++
    }

    this.getStream()
      .writeShort(records)
      .append(stream.getBuffer())
  }

  private add(stream: BinaryStream, a: number, b: number) {
    if(a === b) {
      stream
        .writeBool(true)
        .writeLTriad(a)
    } else {
      stream
        .writeBool(false)
        .writeLTriad(a)
        .writeLTriad(b)
    }
  }

}