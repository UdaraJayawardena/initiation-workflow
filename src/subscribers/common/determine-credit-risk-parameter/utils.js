const _partialPaymentAmountCheck = (amount) => ({
  incoming: amount > 0,
  outgoing: amount < 0
});

const _partialPaymentsFilter = (bt, type) => {
  const description = bt.description;
  const amount = bt.amount;
  if (!description) return false;
  const lowerCaseDesc = description.toLowerCase();
  return lowerCaseDesc.includes('deel')
    && !lowerCaseDesc.includes('voordeel')
    && _partialPaymentAmountCheck(amount)[type];
};

const changeDecimalPoint = (value, fixedNumber) => {

  if (!value) return 0;

  return parseFloat(value.toFixed(fixedNumber));
};

const convertFourDecimal = (value) => changeDecimalPoint(value, 4);

const calAmount = (transactions, fieldName) => {

  if (!fieldName) fieldName = 'amount';

  const totalAmount = transactions.reduce((total, transaction) => {
    const amount = parseFloat(transaction[fieldName]);
    return amount + total;
  }, 0);

  return convertFourDecimal(totalAmount);
};

const btFilterBySubCategory = (btList, subCategory) => btList
  .filter( bt => bt.sub_category === subCategory);

const sumOfAllPartialPayments = (btList, type) => {

  const partialBt = btList.filter(bt => _partialPaymentsFilter(bt, type));

  return { 
    btList: partialBt,
    sumOfAll: calAmount(partialBt)
  };
};

module.exports = {

  calAmount,

  btFilterBySubCategory,

  sumOfAllPartialPayments
};