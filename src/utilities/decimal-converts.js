const _changeDecimalPoint = (value, numOfDecimal) => {

  if (!value) return 0;

  return parseFloat(value.toFixed(numOfDecimal));
};

const convertTwoDecimal = (value) => _changeDecimalPoint(value, 2);

const convertFourDecimal = (value) => _changeDecimalPoint(value, 4);

const convertAnyDecimal = (value, numOfDecimal) => _changeDecimalPoint(value, numOfDecimal);

const roundToNearestAny = (value, nearestNumber) => {
  const reminderValue = value%nearestNumber;
  value = value - reminderValue;
  return value;
};

module.exports = {

  convertTwoDecimal,

  convertFourDecimal,

  convertAnyDecimal,

  roundToNearestAny
};
