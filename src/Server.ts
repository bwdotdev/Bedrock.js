import dgram from 'dgram'
import { EventEmitter } from 'events'

import { Address, BinaryStream } from '@/utils'
import Datagram from '@/packets/Datagram'
import RakNet from '@/RakNet'
import Client from '@/Client'
import BitFlag from '@/utils/BitFlag'
import NAK from '@/packets/NAK'
import ACK from '@/packets/ACK'
import Logger from '@/utils/Logger'

export default class Server extends EventEmitter {

  private ip: string
  private port: number
  private name: string
  private maxPlayers: number

  private startTime: number
  private raknet: RakNet

  private clients: Client[]

  private socket: dgram.Socket

  private logger: Logger

  constructor(ip: string = "127.0.0.1", port: number = 19132) {
    super()

    this.ip = ip
    this.port = port
    this.name = 'Sky Wars'
    this.maxPlayers = 50

    this.startTime = Math.floor(Date.now())

    this.raknet = new RakNet(this)

    this.clients = []

    this.socket = dgram.createSocket("udp4")

    this.logger = new Logger('Server')

    this.startListeners()
    this.socket.bind(this.port, this.ip)
  }

  public getName() {
    return this.name
  }

  public getMaxPlayers() {
    return this.maxPlayers
  }

  public getTime() {
    return Math.floor(Date.now()) - this.startTime
  }

  startListeners() {
    this.socket.on("message", (message: Buffer, recipient: dgram.RemoteInfo) => {
      if (!message.length) return

      const stream = new BinaryStream(message)

      try {
        this.handleOnMessage(stream, {
          ip: recipient.address,
          port: recipient.port,
          family: recipient.family === 'IPv4' ? 4 : 6
        })
      } catch (e) {
        this.logger.error(e.message)
        this.logger.error(e.stack)
      }
    })

    this.socket.on("error", (err: Error) => {
      this.logger.error(err)
    })

    this.socket.on("listening", () => {
      this.logger.info(`Bedrock.js listening on ${this.ip}:${this.port}`)
    })
  }

  handleOnMessage(stream: BinaryStream, recipient: Address) {
    const packetId = stream.buffer[0]
    if (this.hasClient(recipient)) {
      if ((packetId & BitFlag.Valid) === 0) {
        this.logger.debug('Ignored packet:', packetId)
        return
      }

      const client = this.getClient(recipient)
      if(!client) return

      if (packetId & BitFlag.ACK) {
        client.handlePacket(new ACK(stream))
      } else if (packetId & BitFlag.NAK) {
        client.handlePacket(new NAK(stream))
      } else {
        const datagram = Datagram.fromBinary(stream)

        client.handlePackets(datagram)
      }
    } else {
      this.raknet.handleUnconnectedPacket(stream, recipient)
    }
  }

  hasClient(address: Address) {
    return !!this.getClient(address)
  }

  getClient(address: Address) {
    return this.clients.find(client => client.address.ip === address.ip && client.address.port === address.port)
  }

  addClient(client: Client) {
    this.clients.push(client)
  }

  removeClient(client: Client) {
    const index = this.clients.findIndex(c => c.address.ip === client.address.ip && c.address.port === client.address.port)
    if(index === -1) return

    this.clients.splice(index, 1)
  }

  send(stream: BinaryStream, to: Address) {
    this.socket.send(
      stream.buffer,
      to.port,
      to.ip
    )
  }
}
