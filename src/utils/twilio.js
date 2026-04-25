// ─────────────────────────────────────────────
//  Twilio Verify helper
//  Uses the Twilio Verify API (TWILIO_VERIFY_SERVICE_SID)
//  to send and check 6-digit SMS OTP codes.
// ─────────────────────────────────────────────
const twilio = require('twilio');

const ACCOUNT_SID  = process.env.TWILIO_ACCOUNT_SID;
const AUTH_TOKEN   = process.env.TWILIO_AUTH_TOKEN;
const SERVICE_SID  = process.env.TWILIO_VERIFY_SERVICE_SID;

let client = null;

const getClient = () => {
  if (!client) {
    if (!ACCOUNT_SID || !AUTH_TOKEN) {
      throw new Error('Twilio credentials not configured in .env');
    }
    client = twilio(ACCOUNT_SID, AUTH_TOKEN);
  }
  return client;
};

/**
 * Convert a digits-only phone (e.g. "447460726920") to E.164 ("+447460726920").
 * If it already has a '+' it is returned as-is.
 */
const toE164 = (phone) => {
  const str = String(phone).replace(/\s/g, '');
  return str.startsWith('+') ? str : `+${str}`;
};

/**
 * Send a 6-digit SMS OTP via Twilio Verify.
 * @param {string} phone  - digits-only or E.164 phone number
 */
const sendVerificationCode = async (phone) => {
  if (!SERVICE_SID) throw new Error('TWILIO_VERIFY_SERVICE_SID not configured in .env');
  const to = toE164(phone);
  await getClient()
    .verify.v2.services(SERVICE_SID)
    .verifications.create({ to, channel: 'sms' });
};

/**
 * Check a 6-digit SMS OTP via Twilio Verify.
 * @param {string} phone  - digits-only or E.164 phone number
 * @param {string} code   - the 6-digit code entered by the user
 * @returns {boolean} true if approved
 * @throws if the code is wrong or the check fails
 */
const checkVerificationCode = async (phone, code) => {
  if (!SERVICE_SID) throw new Error('TWILIO_VERIFY_SERVICE_SID not configured in .env');
  const to     = toE164(phone);
  const result = await getClient()
    .verify.v2.services(SERVICE_SID)
    .verificationChecks.create({ to, code: String(code) });

  if (result.status !== 'approved') {
    throw new Error('Invalid verification code.');
  }
  return true;
};

module.exports = { sendVerificationCode, checkVerificationCode };
