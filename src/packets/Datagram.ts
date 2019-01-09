import Packet from "@/Packet";
import Protocol from "@/Protocol";
import EncapsulatedPacket from "./EncapsulatedPacket";
import { BinaryStream } from "@/utils";
import BitFlag from "@/utils/BitFlag";

export default class Datagram extends Packet {

  public packets: EncapsulatedPacket[]

  public sequenceNumber: number = 0

  public packetPair: boolean = false
  public continuousSend: boolean = false
  public needsBAndAs: boolean = false

  constructor(packets: EncapsulatedPacket[] = [], id: number = Protocol.DATA_PACKET_4) {
    super(id)

    this.packets = packets
  }

  static fromBinary(stream: BinaryStream): Datagram {
    console.log('PACKET ID', stream.buffer)
    const flags = stream.readByte()
    // const datagram = new Datagram([], packetId)
    const datagram = new Datagram([], flags)

    // const flags = stream.readByte()
    datagram.packetPair = (flags & BitFlag.PacketPair) > 0;
    datagram.continuousSend = (flags & BitFlag.ContinuousSend) > 0;
    datagram.needsBAndAs = (flags & BitFlag.NeedsBAndS) > 0;

    datagram.sequenceNumber = stream.readLTriad()

    console.log('BOI', stream.offset, stream.buffer)

    while (!stream.feof()) {
      console.log('ep', stream.offset, stream.buffer)
      let packet = EncapsulatedPacket.fromBinary(stream);
      console.log(packet.getStream().buffer)

      if (!packet.getStream().length) {
        break;
      }

      datagram.packets.push(packet);
    }

    return datagram
  }

}