export const arrayBufferToString = (buffer: ArrayBuffer): string => {
  const decoder = new TextDecoder('utf-8');
  return decoder.decode(buffer);
};

export const stringToArrayBuffer = (str: string): ArrayBuffer => {
  const encoder = new TextEncoder();
  return encoder.encode(str).buffer;
};

export const uintArrayToString = (array: Uint8Array): string => {
  const decoder = new TextDecoder('utf-8');
  return decoder.decode(array);
};

export const stringToUintArray = (str: string): Uint8Array => {
  const encoder = new TextEncoder();
  return encoder.encode(str);
};
