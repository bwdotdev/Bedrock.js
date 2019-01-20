import EncapsulatedPacket from "@/network/raknet/EncapsulatedPacket"
import Packet from "@/network/bedrock/Protocol"

export default class ClientToServerHandshakePacket extends EncapsulatedPacket {
    constructor() {
        super(Packet.CLIENT_TO_SERVER_HANDSHAKE_PACKET)
    }
}