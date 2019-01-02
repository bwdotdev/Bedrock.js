"use strict"

const BitStream = require("./BitStream")

class RangeList {
  constructor(stream = undefined) {
    this.ranges = []

    if (stream !== undefined) {
      const count = stream.readCompressed(2)
      let maxEqualToMin = false

      for (let i = 0; i < count; i++) {
        maxEqualToMin = stream.readBit()

        let min = stream.readLong()
        let max = min

        if (!maxEqualToMin) {
          max = stream.readLong()
        }

        this.ranges.push(new Range(min, max))
      }
    }
  }

  isEmpty() {
    return this.ranges.length === 0
  }

  empty() {
    this.ranges = []
  }

  serialize() {
    const stream = new BitStream()

    stream.writeCompressedShort(this.ranges.length)

    for (let i = 0; i < this.ranges.length; i++) {
      stream.writeBit(this.ranges[i].min === this.ranges[i].max)
      stream.writeLong(this.ranges[i].min)

      if (this.ranges[i].min !== this.ranges[i].max) {
        stream.writeLong(this.ranges[i].max)
      }
    }

    return stream
  }

  add(value) {
    for (let i = 0; i < this.ranges.length; i++) {
      let range = this.ranges[i]

      if (range.isInRange(value)) {
        return
      }

      if (range.canExtendMin(value)) {
        range.min--

        this.updateOverlap()

        return
      }

      if (range.canExtendMax(value)) {
        range.max++

        this.updateOverlap()

        return
      }
    }

    this.ranges.push(new Range(value, value))
  }

  updateOverlap() {
    for (let i = 0; i < this.ranges.length; i++) {
      let range = this.ranges[i]

      for (let j = 0; j < this.ranges.length; j++) {
        if (j === i) {
          continue
        }

        let nextRange = this.ranges[j]

        if (range.max === nextRange.min - 1) {
          this.ranges.push(new Range(range.min, nextRange.max))
          this.ranges.splice(i, 1)

          i < j ? this.ranges.splice(j - 1, 1) : this.ranges.splice(j, 1)
        }
      }
    }
  }

  toArray() {
    let ret = []

    for (let i = 0; i < this.ranges.length; i++) {
      ret.concat(this.ranges[i].toArray()).sort((a, b) => {
        return a - b
      })
    }

    return ret
  }
}

class Range {
  constructor(min, max) {
    this.min = min
    this.max = max
  }

  isInRange(value) {
    return value >= this.min && value <= this.max
  }

  canExtendMax(value) {
    return value === this.max + 1
  }

  canExtendMin(value) {
    return value === this.min - 1
  }

  toArray() {
    let ret = []

    for (let i = this.min; i <= this.max; i++) {
      ret.push(i)
    }

    return ret
  }
}

module.exports = RangeList
