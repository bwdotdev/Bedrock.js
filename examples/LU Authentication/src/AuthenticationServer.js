"use strict"

const RakNetMessages = require("../../../src/Messages")
const RakNetServer = require("../../../src/Server")
const BitStream = require("../../../src/utils/BitStream")
const Reliability = require("../../../src/Reliability")

function inet_aton(ip) {
  let ret = []

  for (let i = 0; i < 4; i++) {
    ret.push(parseInt(ip.split(".")[i]))
  }

  return ret
}

class AuthenticationServer {
  constructor() {
    this.rakJS = new RakNetServer("127.0.0.1", 1001, "3.25 ND")

    this.startListening()
  }

  startListening() {
    this.rakJS.on(RakNetMessages.ID_CONNECTION_REQUEST, (packet, recipient) => {
      let client = this.rakJS.getClientByIP(recipient.address)
      let password = ""

      while (!packet.allRead()) {
        password += String.fromCharCode(packet.readByte())
      }

      if (password === this.rakJS.password) {
        let response = new BitStream()
        response.writeByte(RakNetMessages.ID_CONNECTION_REQUEST_ACCEPTED)

        let remoteAddress = inet_aton(recipient.address)
        response.writeByte(remoteAddress[0])
        response.writeByte(remoteAddress[1])
        response.writeByte(remoteAddress[2])
        response.writeByte(remoteAddress[3])

        response.writeShort(recipient.port)
        response.writeShort(0)

        let localAddress = inet_aton(this.rakJS.ip)
        response.writeByte(localAddress[0])
        response.writeByte(localAddress[1])
        response.writeByte(localAddress[2])
        response.writeByte(localAddress[3])

        response.writeShort(this.rakJS.server.address().port)
        client.send(response, Reliability.RELIABLE)
      }
    })
  }
}

module.exports = AuthenticationServer
