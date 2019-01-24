import { BinaryStream, Logger } from '@/utils'
import Client from './Client'
import Login from './network/bedrock/Login'
import Protocol from './network/bedrock/Protocol'

export default class Player {

  private client: Client

  private logger: Logger

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

  private handleLogin(packet: Login) {
    this.logger.debug('Got login. Username:', packet.username)
  }

}
