const convert = (bytes) => {
  let result = bytes / 1050000;

  return result.toFixed(2);
};

module.exports = convert;
