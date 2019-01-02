"use strict"

const assert = require("assert")
const BitStream = require("./utils/BitStream")
const RangeList = require("./utils/RangeList")
const Reliability = require("./Reliability")

class ReliabilityLayer {
  constructor(server, recipient) {
    this.server = server

    this.port = recipient.port
    this.address = recipient.address

    this.acks = new RangeList()
    this.queue = []
    this.outOfOrderPackets = []

    this.sends = []
    this.packetsSent = 0
    this.sendMessageNumberIndex = 0
    this.sendSplitPacketId = 0

    this.sequencedReadIndex = 0
    this.sequencedWriteIndex = 0

    this.orderedReadIndex = 0
    this.orderedWriteIndex = 0

    this.srrt = undefined
    this.rttVar = undefined
    this.rto = 1
    this.remoteSystemTime = 0
    this.last = Date.now()

    let layer = this

    this.interval = setInterval(function() {
      layer.sendLoop()
    }, 30)
  }

  /**
   * Handles a new packet when we receive one
   * @param {BitStream} stream The packet
   */
  *handleData(stream) {
    if (this.handleDataHeader(stream)) {
      yield undefined
    }

    yield* this.handleParsePacket(stream)
  }

  /**
   * Handles the acks packets and other header parts of the packet
   * @param {BitStream} stream The packet
   * @returns {Boolean}
   */
  handleDataHeader(stream) {
    if (stream.readBit()) {
      const rtt = (Date.now() - this.last) / 1000 - stream.readLong() / 1000

      this.last = Date.now()

      if (this.srrt === undefined) {
        this.srrt = rtt
        this.rttVar = rtt / 2
      } else {
        this.rttVar = (1 - 0.25) * this.rttVar + 0.25 * Math.abs(this.srrt - rtt)
        this.srrt = (1 - 0.125) * this.srrt + 0.125 * rtt
      }

      this.rto = Math.max(1, this.srrt + 4 * this.rttVar)

      const ACKS = new RangeList(stream)

      for (let i = 0; i < ACKS.toArray().length; i++) {}

      // TODO: Missing a ton of stuff here
    }

    if (stream.allRead()) {
      return true
    }

    if (stream.readBit()) {
      this.remoteSystemTime = stream.readLong()
    }

    return false
  }

  /**
   * Parses the rest of the packet out so we can handle it later
   * @param {BitStream} stream The packet
   */
  *handleParsePacket(stream) {
    while (!stream.allRead()) {
      const messageNumber = stream.readLong()
      const reliability = stream.readBits(3)

      assert(reliability !== Reliability.RELIABLE_SEQUENCED, "Received unused Reliable Sequenced")

      let orderingChannel
      let orderingIndex

      if (
        reliability === Reliability.UNRELIABLE_SEQUENCED ||
        reliability === Reliability.RELIABLE_ORDERED
      ) {
        orderingChannel = stream.readBits(5)
        orderingIndex = stream.readLong()
      }

      let isSplit = stream.readBit()
      let splitPacketId
      let splitPacketIndex
      let splitPacketCount

      if (isSplit) {
        splitPacketId = stream.readShort()
        splitPacketIndex = stream.readCompressed(4).readLong()
        splitPacketCount = stream.readCompressed(4).readLong()

        if (this.queue[splitPacketId] === undefined) {
          this.queue[splitPacketId] = [splitPacketCount]
        }
      }

      let length = stream.readCompressed(2).readShort()

      stream.alignRead()

      let packet = new BitStream()

      while (length--) {
        packet.writeBit(stream.readBit() === 1)
      }

      if (reliability === Reliability.RELIABLE || reliability === Reliability.RELIABLE_ORDERED) {
        this.acks.add(messageNumber)
      }

      if (isSplit) {
        if (splitPacketId !== undefined && splitPacketIndex !== undefined) {
          this.queue[splitPacketId][splitPacketIndex] = packet

          let ready = true

          for (let i = 0; i < this.queue[splitPacketId].length; i++) {
            if (this.queue[splitPacketId][i] === undefined) {
              ready = false
              break
            }
          }

          if (ready) {
            packet = new BitStream()
            packet.concat(this.queue[splitPacketId])
          } else {
            continue
          }
        }
      }

      if (reliability === Reliability.UNRELIABLE_SEQUENCED) {
        if (orderingIndex !== undefined) {
          if (orderingIndex >= this.sequencedReadIndex) {
            this.sequencedReadIndex = orderingIndex + 1
          } else {
            continue
          }
        }
      } else if (reliability === Reliability.RELIABLE_ORDERED) {
        if (orderingIndex !== undefined && orderingChannel !== undefined) {
          if (orderingIndex === this.orderedReadIndex) {
            this.orderedReadIndex++

            let ord = orderingIndex + 1

            for (let i = ord; i < this.orderedReadIndex; i++) {}
          } else if (orderingIndex < this.orderedReadIndex) {
            continue
          } else {
            this.outOfOrderPackets[orderingIndex] = packet
          }
        }
      }

      yield packet
    }
  }

  /**
   * Sends a packet to a user
   * @param {BitStream} packet
   * @param {Number} reliability
   */
  send(packet, reliability) {
    let orderingIndex

    if (reliability === Reliability.UNRELIABLE_SEQUENCED) {
      orderingIndex = this.sequencedWriteIndex

      this.sequencedWriteIndex++
    } else if (reliability === Reliability.RELIABLE_ORDERED) {
      orderingIndex = this.orderedWriteIndex

      this.orderedWriteIndex++
    } else {
      orderingIndex = undefined
    }

    if (this.packetHeaderLength(reliability, false) + packet.length() >= 1200) {
      let packetOffset = 0
      const chunks = []

      while (packetOffset < packet.length()) {
        const packetLength = 1200 - this.packetHeaderLength(reliability, true)

        chunks.push(packet.buffer.slice(packetOffset, packetOffset + packetLength))

        packetOffset += packetLength
      }

      this.sendSplitPacketId += 1

      chunks.forEach((chunk, idx) => {
        this.sends.push({
          packet: chunk,
          reliability: reliability,
          orderingIndex: orderingIndex,
          splitPacketInfo: {
            id: this.sendSplitPacketId,
            index: idx,
            count: chunks.length
          }
        })
      })
    } else {
      this.sends.push({
        packet: packet,
        reliability: reliability,
        orderingIndex: orderingIndex,
        splitPacketInfo: undefined
      })
    }
  }

  /**
   * This loops until the connection is closed
   */
  sendLoop() {
    while (this.sends.length > 0) {
      let packet = this.sends.pop()
      this.packetsSent++

      const index = this.sendMessageNumberIndex
      this.sendMessageNumberIndex++

      this.sendMessage(
        packet.packet,
        index,
        packet.reliability,
        packet.orderingIndex,
        packet.splitPacketInfo
      )
    }

    if (!this.acks.isEmpty()) {
      const send = new BitStream()

      send.writeBit(true)
      send.writeLong(this.remoteSystemTime)
      send.writeBitStream(this.acks.serialize())

      this.acks.empty()
      this.server.send(send.data, this.port, this.address)
    }
  }

  /**
   * This is to send a message to a client
   * @param {BitStream} data
   * @param {Number} messageNumber
   * @param {Number} reliability
   * @param {Number} index
   * @param {Object} splitPacketInfo
   */
  sendMessage(data, messageNumber, reliability, index, splitPacketInfo) {
    const send = new BitStream()

    send.writeBit(!this.acks.isEmpty())

    if (!this.acks.isEmpty()) {
      send.writeLong(this.remoteSystemTime)
      send.writeBitStream(this.acks.serialize())

      this.acks.empty()
    }

    assert(
      this.packetHeaderLength(reliability, splitPacketInfo !== undefined) + data.length() <= 1200,
      "Packet sent was too large!"
    )

    send.writeBit(true)
    send.writeLong(Date.now() - this.remoteSystemTime) // Implemented time ~ Zaseth
    send.writeLong(messageNumber)
    send.writeBits(reliability, 3)

    if (
      reliability === Reliability.UNRELIABLE_SEQUENCED ||
      reliability === Reliability.RELIABLE_ORDERED
    ) {
      send.writeBits(0, 5)
      send.writeLong(index)
    }

    send.writeBit(splitPacketInfo !== undefined)

    if (splitPacketInfo !== undefined) {
      send.writeShort(splitPacketInfo.id)
      send.writeCompressedLong(splitPacketInfo.index)
      send.writeCompressedLong(splitPacketInfo.count)
    }

    send.writeCompressedShort(data.length() * 8)
    send.alignWrite()

    for (let i = 0; i < data.length(); i++) {
      send.writeByte(data.readByte())
    }

    this.server.send(send.data, this.port, this.address)
  }

  /**
   * Calculates the header length of a packet
   * @param {Number} reliability
   * @param {Boolean} split
   * @returns {number}
   */
  packetHeaderLength(reliability, split) {
    let length = 35

    if (
      reliability === Reliability.UNRELIABLE_SEQUENCED ||
      reliability === Reliability.RELIABLE_ORDERED
    ) {
      length += 37
    }

    length += 1

    if (split) {
      length += 80
    }

    length += 16

    return Math.ceil(length / 8)
  }
}

module.exports = ReliabilityLayer
