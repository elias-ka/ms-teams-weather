import { IRequestStrict } from "itty-router";

/**
 * Verifies the signature of the given request.
 * @param req The request to verify.
 * @param secret The secret to use for verification.
 * @returns A promise that resolves to true if the signature is valid, or false otherwise.
 */
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
