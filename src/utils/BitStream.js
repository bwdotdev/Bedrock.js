"use strict"

class BitStream {
  constructor(data = undefined) {
    if (data !== undefined) {
      this.data = data
    } else {
      this.data = Buffer.alloc(0)
    }

    this._byteCount = this.data.length

    this._rBytePos = 0
    this._rBitPos = 7

    this._wBytePos = 0
    this._wBitPos = 7

    this._mask = [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80]
    this._byte = this._byteCount ? this.data.readUInt8(0) : undefined
  }

  length() {
    return this._byteCount
  }

  bits() {
    return this._wBytePos * 8 + (8 - this._wBitPos) - 1
  }

  allRead() {
    return this._rBytePos * 8 + this._rBitPos >= this._byteCount * 8 - 1
  }

  readBit() {
    if (this._rBytePos >= this._byteCount) {
      this._wBytePos = this._rBytePos
      this.writeByte(0)
    }

    const bit = (this.data.readUInt8(this._rBytePos) & this._mask[this._rBitPos]) >> this._rBitPos

    if (--this._rBitPos === -1) {
      this._rBitPos = 7
      this._rBytePos++
    }

    return bit
  }

  writeBit(b) {
    if (this._wBitPos === 7) {
      const oldBuffer = this.data

      this.data = Buffer.alloc(this._wBytePos + 1)
      this._byteCount = this._wBytePos + 1

      oldBuffer.copy(this.data)

      this.data.writeUInt8(0, this._wBytePos)
    }

    let byte = this.data.readUInt8(this._wBytePos)
    byte |= b << this._wBitPos

    this.data.writeUInt8(byte, this._wBytePos)
    this._wBitPos--

    if (this._wBitPos < 0) {
      this._wBitPos = 7
      this._wBytePos++
    }

    return this
  }

  readBits(n) {
    let val = 0

    if (this._rBytePos < this._byteCount) {
      this._byte = this.data.readUInt8(this._rBytePos)
    }

    while (n--) {
      val = (val << 1) | this.readBit()
    }

    return val
  }

  writeBits(n, b) {
    for (let i = b; i > 0; i--) {
      this.writeBit((n >> (i - 1)) & (0x01 === 1))
    }

    return this
  }

  readBitsReversed(n) {
    let val = 0

    for (let i = 0; i < n; i++) {
      val |= this.readBit() << i
    }

    return val
  }

  readBitsStream(ret, n, b = true) {
    if (n <= 0) {
      return undefined
    }

    if (this._rBytePos + Math.floor(n / 8) > this._byteCount) {
      return undefined
    }

    let c = 0

    while (n > 0) {
      if (n >= 8) {
        ret.writeByteOffset(this.readByte(), c)

        n -= 8

        c++
      } else {
        let neg = n - 8

        if (neg < 0) {
          if (b) {
            ret.writeByteOffset(ret.readByteOffset(c) >> -neg, c)
            this._rBytePos += 8 + neg
          } else {
            this._rBytePos += 8
          }
        }

        n = 0
      }
    }

    return ret
  }

  readByte() {
    return this.readBits(8)
  }

  readByteOffset(o) {
    return this.data.readUInt8(o)
  }

  readBytes(n) {
    let val = new BitStream()

    while (n-- && this._rBytePos < this.length()) {
      val.writeByte(this.readByte())
    }

    return val
  }

  writeByte(n) {
    for (let i = 0; i < 8; i++) {
      this.writeBit((n & 0x80) >>> 7 === 1)

      n <<= 1
      n &= 0xff
    }

    return this
  }

  writeByteOffset(n, o) {
    if (o + 1 > this.length()) {
      this.data = Buffer.alloc(o + 1, 0)
      this._byteCount = this._wBytePos + 1

      for (let i = 0; i < this._wBytePos; i++) {
        this.data.writeUInt8(old.readUInt8(i), i)
      }

      this._byteCount = o + 1
    }

    this.data.writeUInt8(n, o)

    return this
  }

  readChar() {
    return this.readBits(8)
  }

  writeBoolean(n) {
    return this.writeByte(n ? 1 : 0)
  }

  readBoolean() {
    return this.readByte() === true
  }

  writeChar(n) {
    return this.writeByte(n)
  }

  readSignedChar() {
    if (this.readBit()) {
      return -this.readBits(7)
    }

    return this.readBits(7)
  }

  readShort() {
    return this.readByte() + (this.readByte() << 8)
  }

  writeShort(n) {
    this.writeByte(n & 0xff)
    this.writeByte((n & 0xff00) >>> 8)

    return this
  }

  writeCompressedShort(n) {
    return this.writeCompressed(n, 2)
  }

  readSignedShort() {
    let firstByte = this.readByte()

    if (this.readBit()) {
      return -(firstByte & (this.readBits(7) << 7))
    }

    return firstByte & (this.readBits(7) << 7)
  }

  readLong() {
    return (
      this.readByte() +
      (this.readByte() << 8) +
      (this.readByte() << 16) +
      this.readByte() * 16777216
    )
  }

  writeLong(n) {
    this.writeShort(n & 0xffff)
    this.writeShort((n & 0xffff0000) >>> 16)

    return this
  }

  writeCompressedLong(n) {
    return this.writeCompressed(n, 4)
  }

  readLongLong() {
    return (
      this.readByte() +
      (this.readByte() << 8) +
      (this.readByte() << 16) +
      this.readByte() * 16777216 +
      this.readByte() * 4294967296 +
      this.readByte() * 1099511627776 +
      this.readByte() * 281474976710656 +
      this.readByte() * 72057594037927936
    )
  }

  writeLongLong(top, bottom) {
    this.writeLong(bottom)
    this.writeLong(top)

    return this
  }

  readFloat() {
    let mantissa = this.readShort()
    let exponent = this.readBit()

    mantissa += this.readBits(7) << 16

    let sign = this.readBit()

    if (sign) {
      sign = -1
    } else {
      sign = 1
    }

    exponent += this.readBits(7) << 1
    exponent -= 127

    return Math.pow(2, exponent) * (mantissa * 1.1920928955078125e-7 + 1) * sign
  }

  writeFloat(n) {
    let sign = n < 0
    let exponent = Math.floor(Math.log2(Math.abs(n)))
    let mantissa = Math.ceil((Math.abs(n) / Math.pow(2, exponent) - 1) / 1.1920928955078125e-7)

    exponent += 127

    this.writeByte(mantissa & 0xff)
    this.writeByte((mantissa & 0xff00) >> 8)
    this.writeBit((exponent & 0x01) === 1)
    this.writeBits((mantissa & 0x7f0000) >> 16, 7)
    this.writeBit(sign)
    this.writeBits((exponent & 0xfe) >> 1, 7)

    return this
  }

  writeBitStream(bs) {
    for (let i = 0; i < bs.bits(); i++) {
      this.writeBit(bs.readBit() === 1)
    }

    return this
  }

  readCompressed(size) {
    let currentByte = size - 1
    let ret = new BitStream()

    while (currentByte > 0) {
      let b = this.readBit()

      if (b) {
        currentByte--
      } else {
        for (let i = 0; i < size - currentByte - 1; i++) {
          ret.writeByte(0)
        }

        for (let i = 0; i < currentByte + 1; i++) {
          ret.writeByte(this.readByte())
        }

        return ret
      }
    }

    if (this.readBit()) {
      ret.writeByte(this.readBits(4) << 4 && 0xf0)
    } else {
      ret.writeByte(this.readByte())
    }

    for (let i = 0; i < size - 1; i++) {
      ret.writeByte(0)
    }

    return ret
  }

  writeCompressed(data, size) {
    let currentByte = size - 1
    let mask = [
      0xff,
      0xff00,
      0xff0000,
      0xff000000,
      0xff00000000,
      0xff0000000000,
      0xff000000000000,
      0xff00000000000000
    ]

    while (currentByte > 0) {
      let zero = (data & mask[currentByte]) === 0
      this.writeBit(zero)

      if (!zero) {
        for (let i = 0; i < currentByte + 1; i++) {
          this.writeByte((data & mask[i]) >> (i * 8))
        }

        return
      }
      currentByte--
    }
    let zero = (data & 0xf0) === 0
    this.writeBit(zero)

    if (zero) {
      this.writeBits(data & (0xf0 >> 4), 4)
    } else {
      this.writeByte(data & 0xff)
    }

    return this
  }

  readString(size) {
    if (size === undefined) {
      size = 33
    }

    let text = ""

    for (let i = 0; i < size; i++) {
      text += String.fromCharCode(this.readByte())
    }

    return text
  }

  writeString(string, size) {
    if (size === undefined) {
      size = 33
    }

    while (string.length < size) {
      string += "\0"
    }

    for (let i = 0; i < string.length; i++) {
      this.writeByte(string.charCodeAt(i))
    }

    return this
  }

  readWString(size) {
    if (size === undefined) {
      size = 33
    }

    let write = true
    let text = ""
    let temp = this.readShort()

    write = temp !== 0

    for (let i = 0; i < size - 1; i++) {
      if (write) {
        temp = String.fromCharCode(temp)
        text += temp
        temp = this.readShort()
        write = temp !== 0
      } else {
        temp = this.readShort()
      }
    }

    return text
  }

  writeWString(string, size) {
    if (size === undefined) {
      size = 33
    }

    while (string.length < size) {
      string += "\0"
    }

    for (let i = 0; i < size; i++) {
      this.writeByte(string.charCodeAt(i))
      this.writeByte(0)
    }

    return this
  }

  alignRead() {
    if (this._rBitPos !== 7) {
      this._rBitPos = 7
      this._rBytePos++
    }
  }

  alignWrite() {
    if (this._wBitPos !== 7) {
      this._wBitPos = 7
      this._wBytePos++
    }
  }

  concat(bs) {
    for (let i = 0; i < bs.length; i++) {
      for (let j = 0; j < bs[i].length(); j++) {
        this.writeByte(bs[i].readByte())
      }
    }
  }

  toBinaryString() {
    let output = ""
    let temp = [
      "0000",
      "0001",
      "0010",
      "0011",
      "0100",
      "0101",
      "0110",
      "0111",
      "1000",
      "1001",
      "1010",
      "1011",
      "1100",
      "1101",
      "1110",
      "1111"
    ]

    for (let i = 0; i < this._byteCount; i++) {
      let byte = this.data.readUInt8(i)
      let partone = (byte & 0xf0) >> 4
      let parttwo = byte & 0x0f

      if (i === this._rBytePos) {
        for (let j = 7; j >= 0; j--) {
          let bit = (byte & this._mask[j]) >> j

          if (j === this._rBitPos) {
            output += " -> "
          }

          output += bit
        }

        output += " "
      } else if (i === this._wBytePos) {
        for (let j = 7; j >= 0; j--) {
          let bit = (byte & this._mask[j]) >> j

          if (j === this._wBitPos) {
            output += " <- "
          }

          output += bit
        }

        output += " "
      } else {
        output += temp[partone] + temp[parttwo] + " "
      }
    }

    return output
  }

  toHexString() {
    let output = ""
    let temp = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"]

    for (let i = 0; i < this._byteCount; i++) {
      let byte = this.data.readUInt8(i)
      let partone = (byte & 0xf0) >> 4
      let parttwo = byte & 0x0f

      output += temp[partone] + temp[parttwo] + " "
    }

    return output
  }

  readLongOffset(offset) {
    var low = this.data.readInt32BE(offset + 4);
    var n = this.data.readInt32BE(offset) * 4294967296.0 + low;
    if (low < 0) n += 4294967296;
    return n;
  }

  offset(bytes, bits) {
    this._rBytePos = bytes
    this._rBitPos = bits || 7
  }
}

module.exports = BitStream
