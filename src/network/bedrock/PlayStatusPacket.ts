import EncapsulatedPacket from "@/network/raknet/EncapsulatedPacket"
import Packet from "@/network/bedrock/Protocol"

export default class PlayStatusPacket extends EncapsulatedPacket {
    constructor() {
        super(Packet.PLAY_STATUS_PACKET)
    }
}