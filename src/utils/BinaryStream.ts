import { Address, Round, AddressFamily } from '@/utils'
import { Magic } from '@/Protocol'
import Logger from '@/utils/Logger'

export default class BinaryStream {
  
  public buffer: Buffer
  public offset: number

  private logger: Logger

  constructor(buffer?: Buffer) {
    this.buffer = Buffer.alloc(0)
    this.offset = 0

    this.logger = new Logger('BinaryStream')

    if(buffer) {
      this.append(buffer)
      this.offset = 0
    }
  }

  /*
   *******************************
   * Stream Management Functions *
   *******************************
  */

  read(len: number): Buffer {
    return this.buffer.slice(this.offset, this.increaseOffset(len, true))
  }

  reset() {
    this.buffer = Buffer.alloc(0)
    this.offset = 0
  }

  setBuffer(buffer: Buffer = Buffer.alloc(0), offset: number = 0) {
    this.buffer = buffer
    this.offset = offset
  }

  increaseOffset(v: number, ret: boolean = false): number {
    return (ret === true ? (this.offset += v) : (this.offset += v) - v)
  }

  append(buf: BinaryStream | Buffer | string): this {
    if(buf instanceof BinaryStream) {
      return this.append(buf.buffer)
    } 
    
    if (typeof buf === "string") {
      buf = Buffer.from(buf, "hex")
    }

    this.buffer = Buffer.concat([this.buffer, buf], this.buffer.length + buf.length)
    this.offset += buf.length

    return this
  }

  getOffset(): number {
    return this.offset
  }

  getBuffer(): Buffer {
    return this.buffer
  }

  get length(): number {
    return this.buffer.length
  }

  /*
   *******************************
   * Buffer Management Functions *
   *******************************
  */

  getRemainingBytes(): number {
    return this.buffer.length - this.offset
  }

  readRemaining(): Buffer {
    let buf = this.buffer.slice(this.offset)
    this.offset = this.buffer.length
    return buf
  }

  readBool(): boolean {
    return this.readByte() !== 0x00
  }

  writeBool(v: boolean): this {
    this.writeByte(v === true ? 1 : 0)
    return this
  }

  readByte(): number {
    return this.getBuffer()[this.increaseOffset(1)]
  }

  writeByte(v: number): this {
    this.append(Buffer.from([v & 0xff]))

    return this
  }

  readShort(): number {
    return this.buffer.readUInt16BE(this.increaseOffset(2))
  }

  writeShort(v: number): this {
    let buf = Buffer.alloc(2)
    buf.writeUInt16BE(v, 0)
    this.append(buf)

    return this
  }

  readSignedShort(): number {
    return this.buffer.readInt16BE(this.increaseOffset(2))
  }

  writeSignedShort(v: number): this {
    let buf = Buffer.alloc(2)
    buf.writeInt16BE(v, 0)
    this.append(buf)

    return this
  }

  readLShort(): number {
    return this.buffer.readUInt16LE(this.increaseOffset(2))
  }

  writeLShort(v: number): this {
    let buf = Buffer.alloc(2)
    buf.writeUInt16LE(v, 0)
    this.append(buf)

    return this
  }

  readSignedLShort(): number {
    return this.buffer.readInt16LE(this.increaseOffset(2))
  }

  writeSignedLShort(v: number): this {
    let buf = Buffer.alloc(2)
    buf.writeInt16LE(v, 0)
    this.append(buf)

    return this
  }

  readTriad(): number {
    return this.buffer.readUIntBE(this.increaseOffset(3), 3)
  }

  writeTriad(v: number): this {
    let buf = Buffer.alloc(3)
    buf.writeUIntBE(v, 0, 3)
    this.append(buf)

    return this
  }

  readLTriad(): number {
    return this.buffer.readUIntLE(this.increaseOffset(3), 3)
  }

  writeLTriad(v: number): this {
    let buf = Buffer.alloc(3)
    buf.writeUIntLE(v, 0, 3)
    this.append(buf)

    return this
  }

  readInt(): number {
    return this.buffer.readInt32BE(this.increaseOffset(4))
  }

  writeInt(v: number): this {
    let buf = Buffer.alloc(4)
    buf.writeInt32BE(v, 0)
    this.append(buf)

    return this
  }

  readLInt(): number {
    return this.buffer.readInt32LE(this.increaseOffset(4))
  }

  writeLInt(v: number): this {
    let buf = Buffer.alloc(4)
    buf.writeInt32LE(v, 0)
    this.append(buf)

    return this
  }

  readFloat(): number {
    return this.buffer.readFloatBE(this.increaseOffset(4))
  }

  readRoundedFloat(accuracy: number): number {
    return Round(this.readFloat(), accuracy)
  }

  writeFloat(v: number): this {
    let buf = Buffer.alloc(8)
    let bytes = buf.writeFloatBE(v, 0)
    this.append(buf.slice(0, bytes))

    return this
  }

  readLFloat(): number {
    return this.buffer.readFloatLE(this.increaseOffset(4))
  }

  readRoundedLFloat(accuracy: number): number {
    return Round(this.readLFloat(), accuracy)
  }

  writeLFloat(v: number): this {
    let buf = Buffer.alloc(8)
    let bytes = buf.writeFloatLE(v, 0)
    this.append(buf.slice(0, bytes))

    return this
  }

  readDouble(): number {
    return this.buffer.readDoubleBE(this.increaseOffset(8))
  }

  writeDouble(v: number): this {
    let buf = Buffer.alloc(8)
    buf.writeDoubleBE(v, 0)
    this.append(buf)

    return this
  }

  readLDouble(): number {
    return this.buffer.readDoubleLE(this.increaseOffset(8))
  }

  writeLDouble(v: number): this {
    let buf = Buffer.alloc(8)
    buf.writeDoubleLE(v, 0)
    this.append(buf)

    return this
  }

  readLong(): number {
    return (this.buffer.readUInt32BE(this.increaseOffset(4)) << 8) + this.buffer.readUInt32BE(this.increaseOffset(4))
  }

  writeLong(v: number): this {
    let MAX_UINT32 = 0xFFFFFFFF

    let buf = Buffer.alloc(8)
    buf.writeUInt32BE((~~(v / MAX_UINT32)), 0)
    buf.writeUInt32BE((v & MAX_UINT32), 4)
    this.append(buf)

    return this
  }

  readLLong(): number {
    return this.buffer.readUInt32LE(0) + (this.buffer.readUInt32LE(4) << 8)
  }

  writeLLong(v: number): this {
    let MAX_UINT32 = 0xFFFFFFFF

    let buf = Buffer.alloc(8)
    buf.writeUInt32LE((v & MAX_UINT32), 0)
    buf.writeUInt32LE((~~(v / MAX_UINT32)), 4)
    this.append(buf)

    return this
  }

  readUnsignedVarInt(): number {
    let value = 0

    for (let i = 0; i <= 35; i += 7) {
      let b = this.readByte()
      value |= ((b & 0x7f) << i)

      if ((b & 0x80) === 0) {
        return value
      }
    }

    return 0
  }

  writeUnsignedVarInt(v: number): this {
    let stream = new BinaryStream()

    for (let i = 0; i < 5; i++) {
      if ((v >> 7) !== 0) {
        stream.writeByte(v | 0x80)
      } else {
        stream.writeByte(v & 0x7f)
        break
      }
      v >>= 7
    }

    this.append(stream.buffer)

    return this
  }

  readVarInt(): number {
    let raw = this.readUnsignedVarInt()
    let tmp = (((raw << 63) >> 63) ^ raw) >> 1
    return tmp ^ (raw & (1 << 63))
  }

  writeVarInt(v: number): this {
    v <<= 32 >> 32
    return this.writeUnsignedVarInt((v << 1) ^ (v >> 31))
  }

  readUnsignedVarLong(): number {
    let value = 0
    for (let i = 0; i <= 63; i += 7) {
      let b = this.readByte()
      value |= ((b & 0x7f) << i)

      if ((b & 0x80) === 0) {
        return value
      }
    }
    return 0
  }

  writeUnsignedVarLong(v: number): this {
    for (let i = 0; i < 10; i++) {
      if ((v >> 7) !== 0) {
        this.writeByte(v | 0x80)
      } else {
        this.writeByte(v & 0x7f)
        break
      }
      v >>= 7
    }

    return this
  }

  readVarLong(): number {
    let raw = this.readUnsignedVarLong()
    let tmp = (((raw << 63) >> 63) ^ raw) >> 1
    return tmp ^ (raw & (1 << 63))
  }

  writeVarLong(v: number): this {
    return this.writeUnsignedVarLong((v << 1) ^ (v >> 63))
  }

  feof(): boolean {
    return typeof this.getBuffer()[this.offset] === "undefined"
  }

  readAddress(): Address {
    let ip, port, family
    switch (this.readByte()) {
      default:
      case AddressFamily.IPV4:
        family = AddressFamily.IPV4
        ip = []
        for (let i = 0; i < 4; i++) {
          ip.push(this.readByte() & 0xff)
        }
        ip = ip.join(".")
        port = this.readShort()
        break
    }
    return { ip, port, family }
  }

  writeAddress(address: Address): this {
    this.writeByte(address.family)
    switch (address.family) {
      case AddressFamily.IPV4:
        address.ip.split(".", 4).forEach(b => this.writeByte((Number(b)) & 0xff))
        this.writeShort(address.port)
        break
      case AddressFamily.IPV6:
        this.logger.error('IPV6 is not yet supported')
        break;
      default:
        this.logger.error('ERR -> Unknown address family:', address.family)
    }
    return this
  }

  writeString(v: string): this {
    this.append(Buffer.from(v, "utf8"))
    return this
  }

  readMagic(): Buffer {
    return this.buffer.slice(this.offset, this.increaseOffset(16, true))
  }

  writeMagic() {
    this.append(Buffer.from(Magic, 'binary'))
    return this
  }

  flip(): this {
    this.offset = 0
    return this
  }

  toHex(spaces: boolean = false): string {
    let hex = this.buffer.toString("hex")
    return spaces ? hex.split(/(..)/).filter(v => v !== "").join(" ") : hex
  }
}