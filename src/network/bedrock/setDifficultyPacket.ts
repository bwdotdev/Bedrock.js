import Packet from '@/network/bedrock/Protocol'
import EncapsulatedPacket from '@/network/raknet/EncapsulatedPacket'
import { BinaryStream } from '@/utils';

export default class setDifficultyPacket extends EncapsulatedPacket {

  private difficulty: number

  constructor(stream: BinaryStream) {
   super(Packet.SET_DIFFICULTY)

   this.difficulty = this.getStream().readUnsignedVarInt()
  }

  protected encodeBody() {
    return this.getStream().writeUnsignedVarInt(this.difficulty)
  }
}