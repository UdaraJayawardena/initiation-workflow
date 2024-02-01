const Mapper = require('./mapper');

const { btFilterBySubCategory } = require('../utils');

const generate = async (
  task,
  smeLoanRequest,
  creditRiskParameterType,
  smeLoanRequestBlock,
  bankTransactions
) => {

  const row = Mapper(
    smeLoanRequest,
    creditRiskParameterType,
    smeLoanRequestBlock.turnOver,
    'bank-account');

  row.bankTransactionId = btFilterBySubCategory(bankTransactions, 'REVENUE')
    .map(bt => bt.id );

  return row;
};

module.exports = { generate };