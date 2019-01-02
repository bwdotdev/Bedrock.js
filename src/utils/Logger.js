"use strict"

class Logger {
  static info(msg) {
    return console.log(`[INFO] > ${msg}`)
  }
  static warn(msg) {
    return console.log(`[WARN] > ${msg}`)
  }
  static error(msg) {
    return console.log(`[ERROR] > ${msg}`)
  }
  static incoming(msg) {
    return console.log(`[INCOMING] > ${msg}`)
  }
  static outgoing(msg) {
    return console.log(`[OUTGOING] > ${msg}`)
  }
}

module.exports = Logger
