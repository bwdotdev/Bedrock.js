import { Address, BinaryStream } from "@/utils"
import Server from "@/Server"
import Datagram from "@/packets/Datagram";
import EncapsulatedPacket from "@/packets/EncapsulatedPacket";
import Protocol from "@/Protocol";
import ConnectionRequest from "./packets/ConnectionRequest";

export default class Client {

  public address: Address

  public mtuSize: number
  public sequenceNumber: number = 0
  public lastSequenceNumber: number = 0

  private server: Server

  public NACKQueue: number[] = []

  public packetQueue: Datagram = new Datagram()

  public tickInterval: NodeJS.Timeout

  constructor(address: Address, mtuSize: number, server: Server) {
    this.address = address
    this.mtuSize = mtuSize
    this.server = server

    this.tickInterval = setInterval(() => {
      this.tick()
    }, 500);
  }

  tick() {
    // console.log('tick!')
    if(this.packetQueue.packets.length) {
      console.log('Sending', this.packetQueue.packets.length, 'packets')
      this.packetQueue.sequenceNumber++
      this.server.send(this.packetQueue.encode(), this.address)
      this.packetQueue.packets = []
    }
  }

  sendPacket(packet: EncapsulatedPacket) {
    this.packetQueue.packets.push(packet);
  }

  handlePackets(datagram: Datagram) {
    console.log('HANDLE PACKETS')
    const packets = datagram.packets

    if(datagram.sequenceNumber === 0 || datagram.sequenceNumber - this.lastSequenceNumber === 1) {
      this.lastSequenceNumber = datagram.sequenceNumber
    } else {
      for(let i = this.lastSequenceNumber; i < datagram.sequenceNumber; i++){
        this.NACKQueue.push(i);
      }
    }

    packets.forEach(packet => this.handlePacket(packet))
  }

  handlePacket(packet: EncapsulatedPacket) {
    switch(packet.getId()) {
      case Protocol.CONNECTION_REQUEST:
        this.handleConnectionRequest(packet)
        break;
      default:
        console.log("Game packet not yet implemented:", packet.getId())
        console.log(packet.getStream().buffer)
    }
  }

  handleConnectionRequest(packet: EncapsulatedPacket) {
    console.log('HANDLE CONNECTION REQUEST')
    const request = ConnectionRequest.fromEncapsulated(packet)
    console.log(request.clientId)
    console.log(request.sendPingTime)
    console.log(request.hasSecurity)
    // console.log(packet.time.toString(), new Date().getTime())
    // process.exit()

    // const time = Date.now() - this.server.startTime
    // const reply = new GamePackets.ConnectionRequestAccepted(this.port, time, time, this.address)
    // this.sendPacket(reply)
  }

}