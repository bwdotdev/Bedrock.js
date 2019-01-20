import Packet from '@/network/Packet'
import ACK from '@/network/raknet/ACK'
import ConnectionRequest from '@/network/raknet/ConnectionRequest'
import ConnectionRequestAccepted from '@/network/raknet/ConnectionRequestAccepted'
import Datagram from '@/network/raknet/Datagram'
import EncapsulatedPacket from '@/network/raknet/EncapsulatedPacket'
import NAK from '@/network/raknet/NAK'
import Protocol from '@/network/raknet/Protocol'
import Server from '@/Server'
import { Address, BinaryStream } from '@/utils'
import Logger from '@/utils/Logger'

export default class Client {

  public id: number | null = null

  public address: Address

  public mtuSize: number
  public messageIndex: number = 0
  public sequenceNumber: number = 0
  public lastSequenceNumber: number = 0
  public splitId: number = 0

  public channelIndex: number[] = []

  public ACKQueue: ACK = new ACK()
  public NAKQueue: NAK = new NAK()

  public datagramQueue: Datagram[] = []
  public packetQueue: Datagram = new Datagram()

  public recoveryQueue: Map<number, Datagram> = new Map()

  public tickInterval: NodeJS.Timeout

  private server: Server

  private logger: Logger

  constructor(address: Address, mtuSize: number, server: Server) {
    this.address = address
    this.mtuSize = mtuSize
    this.server = server

    this.packetQueue.needsBAndAs = true

    this.logger = new Logger('Client')

    this.tickInterval = setInterval(() => {
      this.tick()
    }, 500)
  }

  public disconnect(reason: string = 'unknown reason') {
    this.server.removeClient(this)

    this.logger.debug(`${this.address.ip}:${this.address.port} disconnected: "${reason}"`)
  }

  public handlePackets(datagram: Datagram) {
    const packets = datagram.packets

    const diff = datagram.sequenceNumber - this.lastSequenceNumber

    if(this.NAKQueue.ids.length) {
      const index = this.NAKQueue.ids.findIndex(i => i === datagram.sequenceNumber)
      if(index !== -1) this.NAKQueue.ids.splice(index, 1)

      if(diff !== 1) {
        for(let i = this.lastSequenceNumber; i < datagram.sequenceNumber; i++) {
          this.NAKQueue.ids.push(i)
        }
      }
    }

    this.ACKQueue.ids.push(datagram.sequenceNumber)

    if(diff >= 1) {
      this.lastSequenceNumber = datagram.sequenceNumber
    }

    packets.forEach(packet => this.handlePacket(packet))
  }

  public handlePacket(packet: Packet) {
    if(packet instanceof EncapsulatedPacket) return this.handleEncapsulatedPacket(packet)

    if(packet instanceof ACK) {
      packet.ids.forEach(id => {
        const pk = this.recoveryQueue.get(id)
        if(pk) {
          this.recoveryQueue.delete(id)
        }
      })
    }

    if(packet instanceof NAK) {
      packet.ids.forEach(id => {
        const pk = this.recoveryQueue.get(id)
        if(pk) {
          this.datagramQueue.push(pk)
          this.recoveryQueue.delete(id)
        }
      })
    }
  }

  private tick() {
    if(this.ACKQueue.ids.length) {
      this.server.send(this.ACKQueue.encode(), this.address)
      this.ACKQueue.ids = []
    }

    if(this.NAKQueue.ids.length) {
      this.server.send(this.NAKQueue.encode(), this.address)
      this.NAKQueue.ids = []
    }

    if(this.datagramQueue.length) {
      const limit = 16
      let i = 0
      this.datagramQueue.forEach(async (datagram, index) => {
        if(i > limit) return

        this.recoveryQueue.set(datagram.sequenceNumber, datagram)
        this.server.send(datagram.encode(), this.address)
        this.datagramQueue.splice(index, 1)

        i++
      })
    }

    if(this.packetQueue.packets.length) {
      this.sendPacketQueue()
    }
  }

  private queueEncapsulatedPacket(packet: EncapsulatedPacket, immediate: boolean = false) {
    if(packet.isReliable()) {
      packet.messageIndex = this.messageIndex++
    }

    if(packet.isSequenced()) {
      packet.orderIndex = this.channelIndex[packet.orderChannel]++
    }

    const maxSize = this.mtuSize - 60

    if(packet.getStream().buffer.length > maxSize) {
      const splitId = ++this.splitId % 65536
      let splitIndex = 0
      const splitCount = Math.ceil(packet.getStream().length / maxSize)

      while(!packet.getStream().feof()) {
        const stream = new BinaryStream(packet.getStream().buffer.slice(
          packet.getStream().offset,
          packet.getStream().offset += maxSize,
        ))
        const pk = new EncapsulatedPacket()
        pk.splitId = splitId
        pk.hasSplit = true
        pk.splitCount = splitCount
        pk.reliability = packet.reliability
        pk.splitIndex = splitIndex
        pk.setStream(stream)

        if(splitIndex > 0) {
          pk.messageIndex = this.messageIndex++
        } else {
          pk.messageIndex = packet.messageIndex
        }

        pk.orderChannel = packet.orderChannel
        pk.orderIndex = packet.orderIndex

        this.addToQueue(pk, immediate)
        splitIndex++
      }
    } else {
      this.addToQueue(packet, immediate)
    }
  }

  private addToQueue(packet: EncapsulatedPacket, immediate: boolean = false) {
    const length = this.packetQueue.packets.length
    if((length + packet.getStream().length) > (this.mtuSize - 36)) {
      this.sendPacketQueue()
    }

    if(packet.needsACK) {
      this.logger.debug('Packet needs ACK:', packet.getId())
    }

    this.packetQueue.packets.push(packet)

    if(immediate) {
      this.sendPacketQueue()
    }
  }

  private sendPacketQueue() {
    this.packetQueue.sequenceNumber++
    this.server.send(this.packetQueue.encode(), this.address)
    this.packetQueue.packets = []
  }

  private handleEncapsulatedPacket(packet: EncapsulatedPacket) {
    switch(packet.getId()) {
      case Protocol.CONNECTION_REQUEST:
        this.handleConnectionRequest(packet)
        break
      case Protocol.DISCONNECTION_NOTIFICATION:
        this.disconnect('Client disconnected')
        break
      default:
        this.logger.error('Game packet not yet implemented:', packet.getId())
        this.logger.error(packet.getStream().buffer)
    }
  }

  private handleConnectionRequest(packet: EncapsulatedPacket) {
    const request = ConnectionRequest.fromEncapsulated(packet)

    this.id = request.clientId

    const reply = new ConnectionRequestAccepted(this.address, request.sendPingTime, this.server.getTime())
    this.addToQueue(reply)
  }

}
