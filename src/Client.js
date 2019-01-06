const Protocol = require('./Protocol')
const EncapsulatedPacket = require('./packets/EncapsulatedPacket')
const GamePackets = require('./game-packets')

class Client {

  constructor(address, port, mtuSize, server) {
    this.address = address
    this.port = port
    this.mtuSize = mtuSize
    this.server = server

    this.NACKQueue = [];
    this.packetQueue = new EncapsulatedPacket([]);

    this.sequenceNumber = 0;
    this.lastSequenceNumber = 0;

    this.tickInterval = setInterval(() => {
      this.tick()
    }, 1000/2);
  }

  tick() {
    // console.log('tick!')
    if(this.packetQueue.packets.length) {
      console.log('Sending', this.packetQueue.packets.length, 'packets')
      this.packetQueue.sequenceNumber++
      this.server.send(this.packetQueue.encode(), this)
      this.packetQueue.packets = []
    }
  }

  sendPacket(gamePacket) {
    this.packetQueue.packets.push(gamePacket);
  }

  handlePackets(encapulatedPacket) {
    const packets = encapulatedPacket.packets

    if(encapulatedPacket.sequenceNumber === 0 || encapulatedPacket.sequenceNumber - this.lastSequenceNumber === 1) {
      this.lastSequenceNumber = encapulatedPacket.sequenceNumber
    } else {
      for(let i = this.lastSequenceNumber; i < encapulatedPacket.sequencenumber; i++){
        this.NACKQueue.push(i);
      }
    }

    packets.forEach(packet => this.handlePacket(packet))
  }

  handlePacket(byteBuffer) {
    const packetId = byteBuffer.readByte()
    console.log('Got packet', packetId)
    
    switch(packetId) {
      case Protocol.CONNECTION_REQUEST:
        this.handleConnectionRequest(byteBuffer)
        break;
      default:
        console.log("Game packet not yet implemented:", packetId)
    }
  }

  handleConnectionRequest(byteBuffer) {
    const packet = new GamePackets.ConnectionRequest(byteBuffer)
    // console.log(packet.cid.toString())
    // console.log(packet.time.toString(), new Date().getTime())
    // process.exit()
    const reply = new GamePackets.ConnectionRequestAccepted(this.port, + new Date(), this.address)
    this.sendPacket(reply)
  }

}

module.exports = Client