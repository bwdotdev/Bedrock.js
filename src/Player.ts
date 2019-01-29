import { Logger } from '@/utils'
import Client from './Client'

export default class Player {

  public username: string | null = null
  public displayName: string | null = null
  public clientUUID: string | null = null
  public xuid: string | null = null
  public publicKey: string | null = null

  private client: Client

  private logger: Logger

  constructor(client: Client) {
    this.client = client
    this.logger = new Logger('Player')
  }

  public getAddress() {
    return this.client.address
  }

}
