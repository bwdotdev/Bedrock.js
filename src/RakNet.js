const Client = require("./Client")
const Protocol = require("./Protocol")

const Packets = require('./packets')

class RakNet {

  constructor(server) {
    this.server = server
  }

  handleUnconnectedPacket(stream, recipient) {
    const id = stream.buffer[0]

    switch (id) {
      case Protocol.UNCONNECTED_PING:
        this.handleUnconnectedPing(stream, recipient)
        break;
      case Protocol.OPEN_CONNECTION_REQUEST_1:
        this.handleOpenConnectionRequestOne(stream, recipient)
        break;
      case Protocol.OPEN_CONNECTION_REQUEST_2:
        this.handleOpenConnectionRequestTwo(stream, recipient)
        break;
      default:
        console.log('Unknown packet:', id)
    }
  }

  handleUnconnectedPing(stream, recipient) {
    const ping = new Packets.UnconnectedPing(stream)
    const pong = new Packets.UnconnectedPong(ping.pingId, this.server.name, this.server.maxPlayers)
    this.server.send(pong.encode(), recipient)
  }

  handleOpenConnectionRequestOne(stream, recipient) {
    const req = new Packets.OpenConnectionRequestOne(stream)

    if (req.protocol !== Protocol.PROTOCOL_VERSION) {
      console.log('incompat proto', req.protocol, Protocol.PROTOCOL_VERSION)
      const packet = new Packets.IncompatibleProtocol()
      this.server.send(packet.encode(), recipient)
    } else {
      const packet = new Packets.OpenConnectionReplyOne(req.mtuSize)
      this.server.send(packet.encode(), recipient)
    }
  }

  handleOpenConnectionRequestTwo(stream, recipient) {
    const req = new Packets.OpenConnectionRequestTwo(stream)

    const packet = new Packets.OpenConnectionReplyTwo(req.port, req.mtuSize)
    if(!this.server.hasClient(recipient.address, recipient.port)) {
      const client = new Client(recipient.address, recipient.port, req.mtuSize, this.server)
      this.server.addClient(client)
      this.server.send(packet.encode(), recipient)
    }
  }

}

module.exports = RakNet