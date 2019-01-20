import Packet from '@/network/bedrock/Protocol'
import EncapsulatedPacket from '@/network/raknet/EncapsulatedPacket'

export default class DisconnectPacket extends EncapsulatedPacket {
    constructor() {
        super(Packet.DISCONNECT_PACKET)
    }
}
