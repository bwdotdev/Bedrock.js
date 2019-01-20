import EncapsulatedPacket from "@/packets/EncapsulatedPacket"
import Packet from "@/game-packets/Protocol";

export default class PlayStatusPacket extends EncapsulatedPacket {
    constructor() {
        super(Packet.PLAY_STATUS_PACKET)
    }
}