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

  const debtAtThirdParties = preDebtsAtThirdParty.filter(debtsAtThirdParty =>
    debtsAtThirdParty.debtType === 'tax-payment-overdue');

  const totalTaxDebt = calAmount(debtAtThirdParties, 'outstandingDebtAmount');

  const totalTaxDebtTurnover  = (totalTaxDebt/ turnOver ) * 100;

  const row = Mapper(
    smeLoanRequest,
    creditRiskParameterType,
    totalTaxDebt,
    'debt-form');

  row.turnover = totalTaxDebtTurnover;

  return row;
};

module.exports = { generate };