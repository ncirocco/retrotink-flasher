import { CMD } from "./serial";

export const processLine = async (line: string) => {
  const hexData = line.trim().substring(1);
  const bytes = hexStringToBytes(hexData);

  return new Uint8Array([CMD.Write, ...bytes]);
};

const hexStringToBytes = (hexString: string) => {
  const bytes = new Uint8Array(Math.ceil(hexString.length / 2));

  for (let i = 0, j = 0; i < hexString.length; i += 2, j++) {
    const hexByte = hexString.substring(i, i + 2);
    bytes[j] = parseInt(hexByte, 16);
  }

  return bytes;
};
