"use strict"

const BitStream = require("./utils/BitStream")
const ByteBuffer = require("bytebuffer")
const ReliabilityLayer = require("./ReliabilityLayer")
const Messages = require("./Protocol")

const EventEmitter = require("events")

class Server extends EventEmitter {
  constructor(ip = "127.0.0.1", port = 19132, password) {
    super()

    this.ip = ip
    this.port = port
    this.password = password
    this.name = 'Sky Wars'
    this.maxPlayers = 50

    this.raknet = new (require('./RakNet'))(this)

    this.clients = []

    this.server = require("dgram").createSocket("udp4")
    this.logger = require("./utils/Logger")

    this.startListeners()
  }

  startListeners() {
    this.server.on("message", (message, recipient) => {
      const stream = new ByteBuffer().append(message, "hex")

      try {
        this.handleOnMessage(stream, recipient)
      } catch (e) {
        this.logger.error(e.message)
        this.logger.error(e.stack)
      }
    })

    this.server.on("error", (err) => {
      this.logger.error(err)
    })

    this.server.on("listening", () => {
      const addr = this.server.address()

      this.logger.info(`Bedrock.js listening on ${addr.address}:${addr.port}`)
    })

    this.server.bind(this.port, this.ip)
  }

  handleOnMessage(stream, recipient) {
    if (stream.length === 2) {
      if (stream.readByte() === Messages.ID_OPEN_CONNECTION_REQUEST) {
        this.logger.info(`${recipient.address}:${recipient.port} has connected`)

        this.clients[recipient.address] = new ReliabilityLayer(this.server, recipient)

        this.server.send(
          Buffer.from([Messages.ID_OPEN_CONNECTION_REPLY]),
          recipient.port,
          recipient.address
        )
      }
    } else {
      if (this.clients[recipient.address] !== undefined) {
        const packets = this.clients[recipient.address].handleData(stream)
        let isFinished = false

        while (!isFinished) {
          const next = packets.next()

          if (next.value !== undefined) {
            const packetType = next.value.readByte()

            if (this.listenerCount(String(packetType)) > 0) {
              this.emit(String(packetType), next.value, recipient)
            } else {
              this.logger.warn(
                `No listener found for packet ID ${packetType}. Did you add any event listeners?`
              )
            }
          }

          if (next.done) {
            isFinished = true
          }
        }
      } else {
        this.raknet.handleUnconnectedPacket(stream, recipient)
      }
    }
  }

  getClientByIP(ip) {
    return this.clients[ip]
  }

  send(bitStream, to) {
    console.log('sending to', to)
    this.server.send(
      bitStream.buffer,
      to.port,
      to.address
    )
  }
}

module.exports = Server
