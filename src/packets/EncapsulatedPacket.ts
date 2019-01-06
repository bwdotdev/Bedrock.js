import Packet from "@/Packet"

export default class EncapsulatedPacket extends Packet {

  public reliability: number

  public messageIndex: number

  public hasSplit: boolean
  public splitCount: number
  public splitId: number
  public splitIndex: number

  public orderIndex: number
  public orderChannel: number

}