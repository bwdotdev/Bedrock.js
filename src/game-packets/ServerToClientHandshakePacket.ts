import EncapsulatedPacket from "@/packets/EncapsulatedPacket"
import Packet from "@/game-packets/Protocol";

export default class ServerToClientHandshakePacket extends EncapsulatedPacket {
    constructor() {
        super(Packet.SERVER_TO_CLIENT_HANDSHAKE_PACKET)
    }
}