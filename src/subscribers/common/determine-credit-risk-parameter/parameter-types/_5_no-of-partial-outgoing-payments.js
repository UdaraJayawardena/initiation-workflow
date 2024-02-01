const Mapper = require('./mapper');

const { sumOfAllPartialPayments } = require('../utils');

const generate = async (
  task,
  smeLoanRequest,
  creditRiskParameterType,
  smeLoanRequestBlock,
  bankTransactions
) => {

  const { btList, sumOfAll } = sumOfAllPartialPayments(bankTransactions, 'outgoing');

  const row = Mapper(
    smeLoanRequest,
    creditRiskParameterType,
    sumOfAll,
    'bank-account');

  row.bankTransactionId = btList.map(bt => bt.id );

  return row;
};

module.exports = { generate };