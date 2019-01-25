import { BinaryStream, Logger } from '@/utils'
import Client from './Client'
import GamePacket from './network/bedrock/GamePacket'
import Login from './network/bedrock/Login'
import PlayStatus, { PlayStatusIndicator } from './network/bedrock/PlayStatus'
import Protocol from './network/bedrock/Protocol'
import StartGame from './network/bedrock/StartGame'

export default class Player {

  private client: Client

  private logger: Logger

  private username: string | null = ''
  private displayName: string | null = ''
  private clientUUID: string | null = null
  private xuid: string | null = null
  private publicKey: string | null = null

  private protocol: number = 0

  constructor(client: Client) {
    this.client = client
    this.logger = new Logger('Player')
  }

  public getAddress() {
    return this.client.address
  }

  public handlePacket(stream: BinaryStream) {
    switch(stream.buffer[0]) {
      case Protocol.LOGIN:
        this.handleLogin(new Login(stream))
        break
      default:
        this.logger.error('Game packet not yet implemented:', stream.buffer[0])
        this.logger.error(stream.buffer)
    }
  }

  private sendPacket(packet: GamePacket, immediate = false, needACK = false) {
    this.client.queueEncapsulatedPacket(packet, immediate)
  }

  private sendPlayStatus(status: PlayStatusIndicator, immediate = false) {
    const packet = new PlayStatus(status)
    this.sendPacket(packet, immediate)
  }

  private handleLogin(packet: Login) {
    this.logger.debug('Got login. Username:', packet.username)

    this.username = this.displayName = packet.username
    this.clientUUID = packet.clientUUID
    this.xuid = packet.xuid
    this.publicKey = packet.publicKey

    this.protocol = packet.protocol

    this.sendPlayStatus(PlayStatusIndicator.Okay, true)

    const pk = new StartGame()
    pk.worldName = 'some world'
    this.sendPacket(pk)
  }

}
