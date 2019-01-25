enum Protocol {
  LOGIN = 0x01, // 1
  PLAY_STATUS = 0x02, // 2
  SERVER_TO_CLIENT_HANDSHAKE = 0x03, // 3
  CLIENT_TO_SERVER_HANDSHAKE = 0x04, // 4
  DISCONNECT = 0x05, // 5
  START_GAME = 0x0b, // 11

  SET_TIME = 0x0a,

  SET_DIFFICULTY = 0x3c,
}

export default Protocol
