const crypto = require("crypto");

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96-bit IV is the GCM-recommended size
const KEY = Buffer.from(process.env.ENCRYPTION_KEY, "hex"); // must be 32 bytes

if (KEY.length !== 32) {
  throw new Error("ENCRYPTION_KEY must be a 32-byte (64 hex char) value");
}

function encryptBuffer(buffer) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const authTag = cipher.getAuthTag(); // GCM's built-in tamper-detection tag
  return { encrypted, iv, authTag };
}

function decryptBuffer(encrypted, iv, authTag) {
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag); // throws if the ciphertext was tampered with
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

module.exports = { encryptBuffer, decryptBuffer };