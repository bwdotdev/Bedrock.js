import EncapsulatedPacket from "@/network/raknet/EncapsulatedPacket"
import Packet from "@/network/bedrock/Protocol"

export default class LoginPacket extends EncapsulatedPacket {
    constructor() {
        super(Packet.LOGIN_PACKET)
    }
}