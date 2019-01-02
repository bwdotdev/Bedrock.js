class UnconnectedPing {

    constructor(byteBuffer) {
        this.pingId = byteBuffer.readLong(1)
    }

}

module.exports = UnconnectedPing