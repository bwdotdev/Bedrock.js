import EncapsulatedPacket from "@/packets/EncapsulatedPacket"
import Packets from "@/game-packets/Protocol"

export default class LoginPacket extends EncapsulatedPacket {
    constructor() {
        super(Packets.LOGIN_PACKET)
    }
}