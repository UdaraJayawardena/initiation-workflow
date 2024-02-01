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
    debtsAtThirdParty.debtType === 'debt-collector' ||
    debtsAtThirdParty.debtType === 'collection-agency');

  const totalPaymentsOverdue  = calAmount(debtAtThirdParties, 'outstandingDebtAmount');

  const totalPaymentsOverdueDebtTurnover  = (totalPaymentsOverdue/ turnOver ) * 100;

  const row = Mapper(
    smeLoanRequest,
    creditRiskParameterType,
    totalPaymentsOverdue,
    'debt-form');

  row.turnover = totalPaymentsOverdueDebtTurnover;

  return row;
};

module.exports = { generate };