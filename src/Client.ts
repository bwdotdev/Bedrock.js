import { Address } from "@/utils"
import Server from "@/Server"
import Datagram from "@/packets/Datagram"
import EncapsulatedPacket from "@/packets/EncapsulatedPacket"
import Protocol from "@/Protocol"
import ConnectionRequest from "./packets/ConnectionRequest"
import ConnectionRequestAccepted from "./packets/ConnectionRequestAccepted"
import NAK from "./packets/NAK"
import ACK from "./packets/ACK"
import Packet from "./Packet"

export default class Client {

  public address: Address

  public mtuSize: number
  public sequenceNumber: number = 0
  public lastSequenceNumber: number = 0

  private server: Server

  public ACKQueue: ACK = new ACK()
  public NAKQueue: NAK = new NAK()

  public datagramQueue: Datagram[] = []
  public packetQueue: Datagram = new Datagram()

  public recoveryQueue: Map<number, Datagram> = new Map()

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
      this.packetQueue.sequenceNumber++
      this.server.send(this.packetQueue.encode(), this.address)
      this.packetQueue.packets = []
    }

    if(this.datagramQueue.length) {
      let limit = 16
      let i = 0
      this.datagramQueue.forEach(async(datagram, index) => {
        if(i > limit) return

        this.server.send(datagram.encode(), this.address)
        this.datagramQueue.splice(index, 1)

        i++
      })
    }

    if(this.ACKQueue.ids.length) {
      this.server.send(this.ACKQueue.encode(), this.address)
      this.ACKQueue.ids = []
    }

    if(this.NAKQueue.ids.length) {
      this.server.send(this.NAKQueue.encode(), this.address)
      this.NAKQueue.ids = []
    }
  }

  sendPacket(packet: EncapsulatedPacket) {
    this.packetQueue.packets.push(packet);
  }

  handlePackets(datagram: Datagram) {
    console.log('HANDLE PACKETS')
    const packets = datagram.packets

    const index = this.NAKQueue.ids.findIndex(nid => nid === datagram.sequenceNumber)
    if(index !== -1) this.NAKQueue.ids.splice(index, 1)

    this.ACKQueue.ids.push(datagram.sequenceNumber)

    if(datagram.sequenceNumber === 0 || datagram.sequenceNumber - this.lastSequenceNumber === 1) {
      this.lastSequenceNumber = datagram.sequenceNumber
    } else {
      for(let i = this.lastSequenceNumber; i < datagram.sequenceNumber; i++){
        this.NAKQueue.ids.push(i);
      }
    }

    packets.forEach(packet => this.handlePacket(packet))
  }

  handlePacket(packet: Packet) {
    if(packet instanceof EncapsulatedPacket) return this.handleEncapsulatedPacket(packet)

    if(packet instanceof ACK) {
      // https://github.com/pmmp/RakLib/blob/2f5dfdaa28ff69d72cd1682faa521e18b17a15ef/src/server/Session.php#L599
      console.log('ACK NOT IMPLEMENTED')
    }

    if(packet instanceof NAK) {
      // https://github.com/pmmp/RakLib/blob/2f5dfdaa28ff69d72cd1682faa521e18b17a15ef/src/server/Session.php#L611
      console.log('CLIENT NAK')
      packet.ids.forEach(id => {
        if(this.recoveryQueue.has(id)) {
          const packet = this.recoveryQueue.get(id)
          if(packet) {
            this.datagramQueue.push(packet)
            this.recoveryQueue.delete(id)
          }
        }
      })
    }
  }

  handleEncapsulatedPacket(packet: EncapsulatedPacket) {
    switch(packet.getId()) {
      case Protocol.CONNECTION_REQUEST:
        this.handleConnectionRequest(packet)
        break;
      case Protocol.DISCONNECTION_NOTIFICATION:
        this.server.removeClient(this)
        break;
      default:
        console.log("Game packet not yet implemented:", packet.getId())
        console.log(packet.getStream().buffer)
    }
  }

  handleConnectionRequest(packet: EncapsulatedPacket) {
    console.log('HANDLE CONNECTION REQUEST')
    const request = ConnectionRequest.fromEncapsulated(packet)
    console.log(request.getStream().buffer)
    // console.log(packet.time.toString(), new Date().getTime())
    // process.exit()

    // const time = Date.now() - this.server.startTime
    const reply = new ConnectionRequestAccepted(this.address, request.sendPingTime, this.server.getTime())
    this.sendPacket(reply)
  }

}