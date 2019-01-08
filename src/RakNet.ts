import Server from "@/Server";
import { BinaryStream, Address } from "@/utils";
import Protocol from "@/Protocol";
import UnconnectedPing from "@/packets/UnconnectedPing";
import UnconnectedPong from "@/packets/UnconnectedPong";
import IncompatibleProtocol from "./packets/IncompatibleProtocol";
import OpenConnectionRequestOne from "./packets/OpenConnectionRequestOne";
import OpenConnectionReplyOne from "./packets/OpenConnectionReplyOne";
import OpenConnectionRequestTwo from "./packets/OpenConnectionRequestTwo";
import OpenConnectionReplyTwo from "./packets/OpenConnectionReplyTwo";
import Client from "./Client";

export default class RakNet {

  private server: Server

  constructor(server: Server) {
    this.server = server
  }

  handleUnconnectedPacket(stream: BinaryStream, recipient: Address) {
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

  handleUnconnectedPing(stream: BinaryStream, recipient: Address) {
    const ping = new UnconnectedPing(stream)
    const pong = new UnconnectedPong(ping.pingId, this.server.getName(), this.server.getMaxPlayers())
    this.server.send(pong.encode(), recipient)
  }

  handleOpenConnectionRequestOne(stream: BinaryStream, recipient: Address) {
    const req = new OpenConnectionRequestOne(stream)

    if (req.protocol !== Protocol.PROTOCOL_VERSION) {
      console.log('incompat proto', req.protocol, Protocol.PROTOCOL_VERSION)
      const packet = new IncompatibleProtocol()
      this.server.send(packet.encode(), recipient)
    } else {
      const packet = new OpenConnectionReplyOne(req.mtuSize)
      this.server.send(packet.encode(), recipient)
    }
  }

  handleOpenConnectionRequestTwo(stream: BinaryStream, recipient: Address) {
    const req = new OpenConnectionRequestTwo(stream)

    const packet = new OpenConnectionReplyTwo(req.port, req.mtuSize)
    if(!this.server.hasClient(recipient)) {
      const client = new Client(recipient, req.mtuSize, this.server)
      this.server.addClient(client)
      this.server.send(packet.encode(), recipient)
    }
  }

}