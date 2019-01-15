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

  public id: number | null = null

  public address: Address

  public mtuSize: number
  public messageIndex: number = 0
  public sequenceNumber: number = 0
  public lastSequenceNumber: number = 0

  public channelIndex: number[] = []

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

    if(this.ACKQueue.ids.length) {
      this.server.send(this.ACKQueue.encode(), this.address)
      this.ACKQueue.ids = []
    }

    if(this.NAKQueue.ids.length) {
      this.server.send(this.NAKQueue.encode(), this.address)
      this.NAKQueue.ids = []
    }

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

        this.recoveryQueue.set(datagram.sequenceNumber, datagram)
        this.server.send(datagram.encode(), this.address)
        this.datagramQueue.splice(index, 1)

        i++
      })
    }
  }

  queueEncapsulatedPacket(packet: EncapsulatedPacket) {
    // this.packetQueue.packets.push(packet);

    if(packet.isReliable()) {
      packet.messageIndex = this.messageIndex++
    }

    if(packet.isSequenced()) {
      packet.orderIndex = this.channelIndex[packet.orderChannel]++
    }

    let maxSize = this.mtuSize - 60

    if(packet.getStream().buffer.length > maxSize) {

    } else {
      this.addToQueue(packet)
    }
  }

  addToQueue(packet: Packet) {
    // https://github.com/PocketNode/RakNet/blob/f360f66b6439bb2db4ef10cd5a63a3b201a83937/server/Session.js#L426
  }

  handlePackets(datagram: Datagram) {
    const packets = datagram.packets

    const diff = datagram.sequenceNumber - this.lastSequenceNumber

    if(this.NAKQueue.ids.length) {
      const index = this.NAKQueue.ids.findIndex(i => i === datagram.sequenceNumber)
      if(index !== -1) this.NAKQueue.ids.splice(index, 1)

      if(diff !== 1) {
        for(let i = this.lastSequenceNumber; i < datagram.sequenceNumber; i++){
          this.NAKQueue.ids.push(i);
        }
      }
    }

    this.ACKQueue.ids.push(datagram.sequenceNumber)

    if(diff >= 1) {
      this.lastSequenceNumber = datagram.sequenceNumber
    }

    packets.forEach(packet => this.handlePacket(packet))
  }

  handlePacket(packet: Packet) {
    if(packet instanceof EncapsulatedPacket) return this.handleEncapsulatedPacket(packet)

    if(packet instanceof ACK) {
      packet.ids.forEach(id => {
        const packet = this.recoveryQueue.get(id)
        if(packet) {
          this.recoveryQueue.delete(id)
        }
      })
    }

    if(packet instanceof NAK) {
      packet.ids.forEach(id => {
        console.log(id, this.recoveryQueue)
        const packet = this.recoveryQueue.get(id)
        if(packet) {
          console.log(id)
          this.datagramQueue.push(packet)
          this.recoveryQueue.delete(id)
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
    const request = ConnectionRequest.fromEncapsulated(packet)

    this.id = request.clientId

    const reply = new ConnectionRequestAccepted(this.address, request.sendPingTime, this.server.getTime())
    this.sendPacket(reply)
  }

}