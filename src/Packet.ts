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

  public getId(): number {
    return this.id
  }

  public setStream(stream: BinaryStream, updatePacketId: boolean = false) {
    this.stream = stream

    if(updatePacketId) this.id = this.getStream().buffer[0]
  }

  public encode(): BinaryStream {
    this.encodeHeader()
    this.encodeBody()
    return this.stream
  }

  public getStream(): BinaryStream {
    return this.stream
  }

  protected encodeHeader() {
    this.stream.writeByte(this.id)
  }

  protected encodeBody() { }

}