const DecimalConverts = require('./decimal-converts');

const arrayFilterByKey = (array, key, value) => array
  .filter( ele => ele[key] === value);

const arrayTotalByKey = (array, key) => {

  if (!key) key = 'amount';

  const totalAmount = array.reduce((total, nextElement) => {
    const amount = parseFloat(nextElement[key]);
    return amount + total;
  }, 0);

  return DecimalConverts.convertFourDecimal(totalAmount);
};

module.exports = {

  arrayFilterByKey,

  arrayTotalByKey
};