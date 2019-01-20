import Packet from "@/Packet";
import Protocol from "@/packets/Protocol";

export default class OpenConnectionReplyOne extends Packet {

  public mtuSize: number

  constructor(mtuSize: number) {
    super(Protocol.OPEN_CONNECTION_REPLY_1)

    this.mtuSize = mtuSize
  }

  protected encodeBody() {
    return this.getStream()
      .writeMagic()
      .writeLong(Protocol.SERVER_ID)
      .writeByte(0)
      .writeShort(this.mtuSize)
  }

}