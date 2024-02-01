const Mapper = require('./mapper');

const { calAmount } = require('../utils');

const generate = async (
  task,
  smeLoanRequest,
  creditRiskParameterType,
  smeLoanRequestBlock,
  bankTransactions
) => {

  const savingAccountBt = bankTransactions.filter((bankTransactions) =>
    bankTransactions.detailed_category === 'SAVINGS ACCOUNT');

  const nettSavingsAmount= calAmount(savingAccountBt);

  const row = Mapper(
    smeLoanRequest,
    creditRiskParameterType,
    nettSavingsAmount,
    'bank-account');

  row.bankTransactionId = savingAccountBt.map(bt => bt.id);

  return row;
};

module.exports = { generate };