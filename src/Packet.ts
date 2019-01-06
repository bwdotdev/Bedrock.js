import { BinaryStream } from '@/utils'

export default class Packet {

    private id: number
    private stream: BinaryStream

    constructor(packetId: number) {
        this.id = packetId
        this.stream = new BinaryStream()
    }

    public encode(): BinaryStream {
        this.stream.writeByte(this.id)
        this.encodeBody()
        return this.stream
    }

    public getStream(): BinaryStream {
        return this.stream
    }

    protected encodeBody() { }

}