const ByteBuffer = require("bytebuffer")
const ReliabilityLayer = require("./ReliabilityLayer")
const Messages = require("./Protocol")
const EncapsulatedPacket = require("./packets/EncapsulatedPacket")

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
      if (this.hasClient(recipient.address, recipient.port)) {
        const client = this.getClient(recipient.address, recipient.port)
        const encapsulatedPacket = new EncapsulatedPacket(stream)

        client.handlePackets(encapsulatedPacket)
        // process.exit()
      } else {
        this.raknet.handleUnconnectedPacket(stream, recipient)
      }
    }
  }

  hasClient(ip, port) {
    return !!this.getClient(ip, port)
  }

  getClient(ip, port) {
    return this.clients.find(client => client.address === ip && client.port === port)
  }

  addClient(client) {
    this.clients.push(client)
    console.log('added client')
  }

  send(bitStream, to) {
    console.log('sending to', to.address)
    this.server.send(
      bitStream.buffer,
      to.port,
      to.address
    )
  }
}

module.exports = Server
