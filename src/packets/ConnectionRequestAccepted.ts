import Protocol from "@/Protocol";
import { Address, AddressFamily } from "@/utils";
import EncapsulatedPacket from "./EncapsulatedPacket";

export default class ConnectionRequestAccepted extends EncapsulatedPacket {

  public address: Address
  public systemAddresses: Address[]
  public pingTime: number
  public pongTime: number

  constructor(address: Address, pingTime: number, pongTime: number) {
    super(Protocol.CONNECTION_REQUEST_ACCEPTED)

    this.address = address
    this.systemAddresses = [
      { ip: '127.0.0.0', port: 0, family: AddressFamily.IPV4 }
    ]
    this.pingTime = pingTime
    this.pongTime = pongTime
  }

  protected encodeBody() {
    console.log('PingTime', this.pingTime)
    console.log('PongTime', this.pongTime)
    this.getStream()
      .writeAddress(this.address)
      .writeShort(0)

    const addressFiller: Address = { ip: '0.0.0.0', port: 0, family: AddressFamily.IPV4 }
    for(let i = 0; i < 20; i++) {
      this.getStream().writeAddress(this.systemAddresses[i] || addressFiller)
    }

    this.getStream()
      .writeLong(this.pingTime)
      .writeLong(this.pongTime)
  }

}