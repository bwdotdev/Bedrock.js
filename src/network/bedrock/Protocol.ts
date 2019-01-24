enum Protocol {
  LOGIN = 0x01,
  PLAY_STATUS = 0x02,
  SERVER_TO_CLIENT_HANDSHAKE = 0x03,
  CLIENT_TO_SERVER_HANDSHAKE = 0x04,
  DISCONNECT = 0x05,

  SET_TIME = 0x0a,
}

export default Protocol
