import EncapsulatedPacket from "@/network/raknet/EncapsulatedPacket"
import Packet from "@/network/bedrock/Protocol"

export default class DisconnectPacket extends EncapsulatedPacket {
    constructor() {
        super(Packet.DISCONNECT_PACKET)
    }
}