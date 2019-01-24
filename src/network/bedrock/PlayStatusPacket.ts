import Packet from '@/network/bedrock/Protocol'
import EncapsulatedPacket from '@/network/raknet/EncapsulatedPacket'

export default class PlayStatusPacket extends EncapsulatedPacket {

  constructor() {
    super(Packet.PLAY_STATUS)
  }

}
