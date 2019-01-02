class OpenConnectionRequestOne {

    constructor(byteBuffer) {
        byteBuffer.offset = 17 // Magic
        this.protocol = byteBuffer.readByte()
        this.mtuSize = byteBuffer.buffer.length - 17
    }

}

module.exports = OpenConnectionRequestOne