import EncapsulatedPacket from "@/packets/EncapsulatedPacket"
import Packet from "@/game-packets/Protocol";

export default class ClientToServerHandshakePacket extends EncapsulatedPacket {
    constructor() {
        super(Packet.CLIENT_TO_SERVER_HANDSHAKE_PACKET)
    }
}