export enum CMD {
  GetVer = 0x1,
  Erase = 0x2,
  Write = 0x3,
  JumpApp = 0x5,
}

export enum CTRL {
  START_OF_HEADER = 0x01,
  END_OF_TRANSMISION = 0x04,
  DATA_LINK_ESCAPE = 0x10,
}

export interface Message {
  cmd: number;
  payload: Uint8Array;
}

export const decodeDevice = (payload: Uint8Array): string => {
  const zeroIndex = payload.indexOf(0);

  const beforeZero =
    zeroIndex !== -1 ? payload.subarray(0, zeroIndex) : payload;

  const textDecoder = new TextDecoder("utf-8");
  return textDecoder.decode(beforeZero);
};

export const sendCmd = async (port: SerialPort, cmd: Uint8Array) => {
  const writer = port.writable.getWriter();

  const b = txPacket(cmd);

  await writer.write(b);
  await writer.close();
  writer.releaseLock();
};

export const decodeMessage = (bytes: Uint8Array): Message => {
  let startOfHeaderFound = false;
  let escapeNextControlSequence = false;

  const msgBytes: number[] = [];

  for (const b of bytes) {
    if (startOfHeaderFound && escapeNextControlSequence) {
      msgBytes.push(b);
      escapeNextControlSequence = false;
      continue;
    }

    if (b === CTRL.START_OF_HEADER) {
      startOfHeaderFound = true;
      continue;
    }

    if (!startOfHeaderFound) {
      continue;
    }

    if (b === CTRL.DATA_LINK_ESCAPE) {
      escapeNextControlSequence = true;
      continue;
    }

    if (b === CTRL.END_OF_TRANSMISION) {
      break;
    }

    msgBytes.push(b);
  }

  const cmd = msgBytes[0];
  const payload = new Uint8Array(msgBytes.slice(1, msgBytes.length));

  return { cmd, payload };
};

export const txPacket = (b: Uint8Array) => {
  const crc = calcCrc(b);

  const bWithCrc = new Uint8Array([...b, crc & 0xff, (crc >> 8) & 0xff]);
  let bTx = new Uint8Array([CTRL.START_OF_HEADER]);
  bWithCrc.forEach((bb) => {
    if (
      [
        CTRL.START_OF_HEADER,
        CTRL.END_OF_TRANSMISION,
        CTRL.DATA_LINK_ESCAPE,
      ].includes(bb)
    ) {
      bTx = new Uint8Array([...bTx, CTRL.DATA_LINK_ESCAPE, bb]);
    } else {
      bTx = new Uint8Array([...bTx, bb]);
    }
  });

  bTx = new Uint8Array([...bTx, CTRL.END_OF_TRANSMISION]);

  return bTx;
};

const calcCrc = (b: Uint8Array) => {
  // CRC lookup table for polynomial 0x1021
  const lut = [
    0, 4129, 8258, 12387, 16516, 20645, 24774, 28903, 33032, 37161, 41290,
    45419, 49548, 53677, 57806, 61935,
  ];

  let num1 = 0;
  for (let i = 0; i < b.length; i++) {
    const num2 = b[i];
    const num3 = (num1 >> 12) ^ (num2 >> 4);
    const num4 = (lut[num3 & 0x0f] ^ (num1 << 4)) & 0xffff;
    const num5 = (num4 >> 12) ^ num2;
    num1 = (lut[num5 & 0x0f] ^ (num4 << 4)) & 0xffff;
  }

  return num1;
};
