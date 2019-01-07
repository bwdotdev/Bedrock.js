import { BinaryStream } from '@/utils'

export default class Packet {

  private id: number
  private stream: BinaryStream

  constructor(packetId: number, stream?: BinaryStream) {
    this.id = packetId

    if(stream) {
      this.stream = stream
      this.stream.increaseOffset(1) // Packet ID
    } else {
      this.stream = new BinaryStream()
    }
  }

  public encode(): BinaryStream {
    this.stream.writeByte(this.id)
    this.encodeBody()
    return this.stream
  }

  public getStream(): BinaryStream {
    return this.stream
  }

  protected encodeBody() { }

}