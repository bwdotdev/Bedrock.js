import Packet from '@/network/bedrock/Protocol'
import EncapsulatedPacket from '@/network/raknet/EncapsulatedPacket'

export default class LoginPacket extends EncapsulatedPacket {
    constructor() {
        super(Packet.LOGIN_PACKET)
    }
}
