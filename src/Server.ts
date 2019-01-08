import dgram from 'dgram'
import { EventEmitter } from 'events'

import { Address, BinaryStream } from '@/utils'
import Datagram from '@/packets/Datagram';
import RakNet from '@/RakNet';
import Client from '@/Client';

export default class Server extends EventEmitter {

  private ip: string
  private port: number
  private name: string
  private maxPlayers: number

  private startTime: number
  private raknet: RakNet

  private clients: Client[]

  private socket: dgram.Socket

  private logger: any
  // private logger: Logger

  constructor(ip: string = "127.0.0.1", port: number = 19132) {
    super()

    this.ip = ip
    this.port = port
    this.name = 'Sky Wars'
    this.maxPlayers = 50

    this.startTime = Date.now()

    this.raknet = new RakNet(this)

    this.clients = []

    this.socket = dgram.createSocket("udp4")
    // this.logger = require("./utils/Logger")
    this.logger = console

    this.startListeners()
    this.socket.bind(this.port, this.ip)
  }

  public getName() {
    return this.name
  }

  public getMaxPlayers() {
    return this.maxPlayers
  }

  startListeners() {
    this.socket.on("message", (message: Buffer, recipient: dgram.RemoteInfo) => {
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
    // if (stream.length === 2) {
    //   if (stream.readByte() === Messages.ID_OPEN_CONNECTION_REQUEST) {
    //     this.logger.info(`${recipient.address}:${recipient.port} has connected`)

    //     this.clients[recipient.address] = new ReliabilityLayer(this.server, recipient)

    //     this.server.send(
    //       Buffer.from([Messages.ID_OPEN_CONNECTION_REPLY]),
    //       recipient.port,
    //       recipient.address
    //     )
    //   }
    // } else {
      if (this.hasClient(recipient)) {
        const client = this.getClient(recipient)
        const datagram = Datagram.fromBinary(stream)

        if(client) client.handlePackets(datagram)
        // process.exit()
      } else {
        this.raknet.handleUnconnectedPacket(stream, recipient)
      }
    // }
  }

  hasClient(address: Address) {
    return !!this.getClient(address)
  }

  getClient(address: Address) {
    return this.clients.find(client => client.address === address)
  }

  addClient(client: Client) {
    this.clients.push(client)
  }

  send(stream: BinaryStream, to: Address) {
    console.log('sending to', to.ip, stream.buffer.length)
    this.socket.send(
      stream.buffer,
      to.port,
      to.ip
    )
  }
}
