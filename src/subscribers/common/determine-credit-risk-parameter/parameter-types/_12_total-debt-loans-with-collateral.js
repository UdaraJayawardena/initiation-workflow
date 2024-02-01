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
    debtsAtThirdParty.debtType === 'loan' ||
    debtsAtThirdParty.debtType === 'current-account' || 
    debtsAtThirdParty.debtType === 'mortgage');

  const totalDebtLoansWithCollateralAmount = calAmount(debtAtThirdParties, 'outstandingDebtAmount');

  const debtLoansWithCollateralTurnover = (totalDebtLoansWithCollateralAmount/ turnOver ) * 100;

  const row = Mapper(
    smeLoanRequest,
    creditRiskParameterType,
    totalDebtLoansWithCollateralAmount,
    'debt-form');

  row.turnover = debtLoansWithCollateralTurnover;

  return row;
};

module.exports = { generate };