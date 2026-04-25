const normalizePhone = (raw) => {
  if (!raw) return null;
  const d = String(raw).replace(/\D/g, '');
  return (d.length >= 7 && d.length <= 15) ? d : null;
};
const isValidPhone = (raw) => normalizePhone(raw) !== null;
module.exports = { normalizePhone, isValidPhone };
