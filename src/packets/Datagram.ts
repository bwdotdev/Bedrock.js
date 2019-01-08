import Packet from "@/Packet";
import Protocol from "@/Protocol";
import EncapsulatedPacket from "./EncapsulatedPacket";
import { BinaryStream } from "@/utils";

export default class Datagram extends Packet {

  public packets: EncapsulatedPacket[]

  constructor(packets: EncapsulatedPacket[] = [], id: number = Protocol.DATA_PACKET_4) {
    super(id)

    this.packets = packets
  }

  static fromBinary(stream: BinaryStream) {
    return new Datagram([], stream.readByte())
  }

}