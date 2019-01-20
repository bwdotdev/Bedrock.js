enum Protocol {
  PROTOCOL_VERSION = 9,
  SERVER_ID = 925686942,

  INTERNAL_PING = 0x00,
  PING_OPEN_CONNECTIONS = 0x02,
  CONNECTED_PONG = 0x03,
  OPEN_CONNECTION_REQUEST_1 = 0x05,
  OPEN_CONNECTION_REPLY_1 = 0x06,
  OPEN_CONNECTION_REQUEST_2 = 0x07,
  OPEN_CONNECTION_REPLY_2 = 0x08,
  CONNECTION_REQUEST = 0x09,
  CONNECTION_REQUEST_ACCEPTED = 0x10,
  DISCONNECTION_NOTIFICATION = 0x15,
  INCOMPATIBLE_PROTOCOL = 0x19,
  UNCONNECTED_PING = 0x01,
  UNCONNECTED_PONG = 0x1c,

  ACK = 0xc0,
  NAK = 0xa0,

  DATA_PACKET_0 = 0x80,
  DATA_PACKET_1 = 0x81,
  DATA_PACKET_2 = 0x82,
  DATA_PACKET_3 = 0x83,
  DATA_PACKET_4 = 0x84,
  DATA_PACKET_5 = 0x85,
  DATA_PACKET_6 = 0x86,
  DATA_PACKET_7 = 0x87,
  DATA_PACKET_8 = 0x88,
  DATA_PACKET_9 = 0x89,
  DATA_PACKET_A = 0x8a,
  DATA_PACKET_B = 0x8b,
  DATA_PACKET_C = 0x8c,
  DATA_PACKET_D = 0x8d,
  DATA_PACKET_E = 0x8e,
  DATA_PACKET_F = 0x8f,
}

export const Magic = '\x00\xff\xff\x00\xfe\xfe\xfe\xfe\xfd\xfd\xfd\xfd\x12\x34\x56\x78'

export default Protocol
