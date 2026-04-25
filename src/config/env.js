// DB_PASSWORD is intentionally excluded — empty password is valid for local MySQL
const REQUIRED = ['JWT_SECRET', 'DB_HOST', 'DB_USER', 'DB_NAME', 'MSG_ENCRYPTION_KEY'];

const validateEnv = () => {
  const missing = REQUIRED.filter(k => process.env[k] === undefined || process.env[k] === null);
  if (missing.length) {
    console.error('[Env] Missing required variables: ' + missing.join(', '));
    process.exit(1);
  }
  if (process.env.MSG_ENCRYPTION_KEY.length !== 64) {
    console.error('[Env] MSG_ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes)');
    process.exit(1);
  }
};

module.exports = { validateEnv };
