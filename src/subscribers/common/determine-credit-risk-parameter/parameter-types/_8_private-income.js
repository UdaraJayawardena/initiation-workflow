const Mapper = require('./mapper');

const { calAmount } = require('../utils');

const generate = async (
  task,
  smeLoanRequest,
  creditRiskParameterType,
  smeLoanRequestBlock,
  bankTransactions
) => {

  const { turnOver } = smeLoanRequestBlock;

  const privateAccountBts = bankTransactions.filter((bankTransactions) =>
    bankTransactions.detailed_category === 'PRIVATE ACCOUNT');

  const privateIncomeAmount= calAmount(privateAccountBts);

  const row = Mapper(
    smeLoanRequest,
    creditRiskParameterType,
    privateIncomeAmount,
    'bank-account');

  row.bankTransactionId = privateAccountBts.map(bt => bt.id);

  row.turnover = (privateIncomeAmount / turnOver) * 100;

  return row;
};

module.exports = { generate };