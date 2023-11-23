export function encode(buffer) {
  return Buffer.from(buffer).toString("base64url");
}

export function decode(string) {
  return new Uint8Array(Buffer.from(string, "base64url")).buffer;
}
