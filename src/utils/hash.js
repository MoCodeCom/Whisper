const bcrypt = require('bcryptjs');

const ROUNDS = 12;
const hashPassword    = (plain)         => bcrypt.hash(plain, ROUNDS);
const comparePassword = (plain, hashed) => bcrypt.compare(plain, hashed);

module.exports = { hashPassword, comparePassword };
