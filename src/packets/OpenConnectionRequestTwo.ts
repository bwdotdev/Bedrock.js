import Packet from "@/Packet";
import { BinaryStream } from "@/utils";
import Protocol from "@/Protocol";

export default class OpenConnectionRequestTwo extends Packet {

  public port: number
  public mtuSize: number
  public clientId: number

  constructor(stream: BinaryStream) {
    super(Protocol.OPEN_CONNECTION_REQUEST_2, stream)

    this.getStream().offset = 22 // Magic & Security
    this.port = this.getStream().readShort()
    this.mtuSize = this.getStream().readShort()
    this.clientId = this.getStream().readLong()
  }

}