const Mapper = require('./mapper');

const { sumOfAllPartialPayments } = require('../utils');

const generate = async (
  task,
  smeLoanRequest,
  creditRiskParameterType,
  smeLoanRequestBlock,
  bankTransactions
) => {

  const { btList, sumOfAll } = sumOfAllPartialPayments(bankTransactions, 'incoming');

  const row = Mapper(
    smeLoanRequest,
    creditRiskParameterType,
    sumOfAll,
    'bank-account');

  row.bankTransactionId = btList.map(bt => bt.id );

  return row;
};

module.exports = { generate };