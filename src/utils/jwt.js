const jwt = require('jsonwebtoken');

const ACCESS_EXPIRY  = process.env.JWT_EXPIRY         || '7d';
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '30d';
const secret  = () => process.env.JWT_SECRET;
const rSecret = () => process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

const signAccess    = (p) => jwt.sign(p, secret(),  { expiresIn: ACCESS_EXPIRY  });
const signRefresh   = (p) => jwt.sign(p, rSecret(), { expiresIn: REFRESH_EXPIRY });
const verifyAccess  = (t) => jwt.verify(t, secret());
const verifyRefresh = (t) => jwt.verify(t, rSecret());

module.exports = { signAccess, signRefresh, verifyAccess, verifyRefresh };
