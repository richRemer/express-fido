import {randomBytes} from "crypto";

export default function idgen() {
  return randomBytes(64).toString("base64url");
}
