function generateReference(prefix) {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.floor(Math.random() * 9999)
    .toString()
    .padStart(4, "0");
  return `${prefix}-${ts}-${rand}`;
}

module.exports = { generateReference };
