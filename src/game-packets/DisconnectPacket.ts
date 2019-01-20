import EncapsulatedPacket from "@/packets/EncapsulatedPacket"
import Packet from "@/game-packets/Protocol";

export default class DisconnectPacket extends EncapsulatedPacket {
    constructor() {
        super(Packet.DISCONNECT_PACKET)
    }
}