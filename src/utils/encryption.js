/**
 * AES-256-GCM symmetric encryption for pending messages at rest.
 * Key is loaded from MSG_ENCRYPTION_KEY env var (64 hex chars = 32 bytes).
 *
 * Stored format: <iv_hex>:<authTag_hex>:<ciphertext_hex>
 */
const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';

const getKey = () => {
  const hex = process.env.MSG_ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error('[Encryption] MSG_ENCRYPTION_KEY must be a 64-char hex string (32 bytes)');
  }
  return Buffer.from(hex, 'hex');
};

/**
 * Encrypt a plaintext string.
 * @param {string} plaintext
 * @returns {string}  "<iv>:<authTag>:<ciphertext>" all hex-encoded
 */
const encrypt = (plaintext) => {
  const key    = getKey();
  const iv     = crypto.randomBytes(12);                           // 96-bit IV (GCM standard)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const enc    = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag    = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${enc.toString('hex')}`;
};

/**
 * Decrypt a string produced by encrypt().
 * @param {string} ciphertext  "<iv>:<authTag>:<ciphertext>"
 * @returns {string} plaintext
 */
const decrypt = (ciphertext) => {
  const [ivHex, tagHex, encHex] = ciphertext.split(':');
  const key      = getKey();
  const iv       = Buffer.from(ivHex,  'hex');
  const tag      = Buffer.from(tagHex, 'hex');
  const enc      = Buffer.from(encHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(enc).toString('utf8') + decipher.final('utf8');
};

module.exports = { encrypt, decrypt };
