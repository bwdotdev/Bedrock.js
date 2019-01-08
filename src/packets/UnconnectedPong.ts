import Packet from "@/Packet";
import { BinaryStream } from "@/utils";
import Protocol from "@/Protocol";

export default class UnconnectedPong extends Packet {

  public pingId: number
  public name: string
  public maxPlayers: number
  public secondaryName: string

  constructor(pingId: number, name: string, maxPlayers: number, secondaryName = 'Bedrock.js') {
    super(Protocol.UNCONNECTED_PONG)

    this.pingId = pingId
    this.name = name
    this.maxPlayers = maxPlayers
    this.secondaryName = secondaryName
  }

  protected encodeBody() {
    const name = `MCPE;${this.name};27;1.8.0;0;${this.maxPlayers};0;${this.secondaryName}`

    console.log(this.pingId)

    return this.getStream()
      .writeLong(this.pingId)
      .writeLong(Protocol.SERVER_ID)
      .writeMagic()
      .writeShort(name.length)
      .writeString(name)
  }

}