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
    console.log('tick!')
    if(this.packetQueue.packets.length) {
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

  handlePacket(gamePacket) {
    const packetId = gamePacket.byteBuffer.readByte()
    console.log('Got packet', packetId)
    
    switch(packetId) {
      case Protocol.OPEN_CONNECTION_REQUEST:
        this.handleOpenConnectionRequest(gamePacket)
        break;
      default:
        console.log("Game packet not yet implemented:", packetId)
    }
  }

  handleOpenConnectionRequest(gamePacket) {
    const packet = new GamePackets.OpenConnectionRequest(gamePacket.byteBuffer.copy())
    const reply = new GamePackets.OpenConnectionReply(this.port, packet.session)
    this.sendPacket(reply)
  }

}

module.exports = Client