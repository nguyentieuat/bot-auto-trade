function truncateDecimal(number, digits) {
  const factor = Math.pow(10, digits);
  return Math.floor(number * factor) / factor;
}

module.exports = {
  truncateDecimal,
};