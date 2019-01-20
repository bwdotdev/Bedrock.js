import EncapsulatedPacket from "@/network/raknet/EncapsulatedPacket"
import Packet from "@/network/bedrock/Protocol"

export default class ServerToClientHandshakePacket extends EncapsulatedPacket {
    constructor() {
        super(Packet.SERVER_TO_CLIENT_HANDSHAKE_PACKET)
    }
}