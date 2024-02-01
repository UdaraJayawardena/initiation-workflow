const Mapper = require('./mapper');

const { calAmount } = require('../utils');

const generate = async (
  task,
  smeLoanRequest,
  creditRiskParameterType,
  smeLoanRequestBlock,
  bankTransactions,
  debtorsCreditors
) => {

  const { turnOver } = smeLoanRequestBlock;

  const { preDebtsAtThirdParty } = debtorsCreditors;

  const debtAtThirdParties = preDebtsAtThirdParty.filter((debtsAtThirdParty) =>
    debtsAtThirdParty.debtType === 'lease-contract');

  const totalDebtAmount = calAmount(debtAtThirdParties, 'outstandingDebtAmount');

  const totalDebtTurnover = (totalDebtAmount/ turnOver ) * 100;

  const row = Mapper(
    smeLoanRequest,
    creditRiskParameterType,
    totalDebtAmount,
    'debt-form');

  row.turnover = totalDebtTurnover;

  return row;
};

module.exports = { generate };