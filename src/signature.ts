import { IRequestStrict } from "itty-router";

// Verifies the HMAC SHA-256 signature of a request against a secret.
export const verifySignature = async (req: IRequestStrict, secret: string) => {
  const signature = req.headers.get("authorization");
  if (!signature || !secret) {
    return false;
  }
  const msgBuf = Buffer.from(await req.text(), "utf8");
  const sigBuf = Buffer.from(signature, "base64");
  const secretBuf = Buffer.from(secret, "base64");

  const key = await crypto.subtle.importKey("raw", secretBuf, { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
  return crypto.subtle.verify("HMAC", key, sigBuf, msgBuf);
};
