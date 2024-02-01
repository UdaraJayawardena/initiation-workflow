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

  const { perDebtorCreditor } = debtorsCreditors;

  const debtorCreditors = perDebtorCreditor.filter((debtorCreditor) =>
    debtorCreditor.debitorCreditorIndicator === 'debtor');

  const debtorOutstandingAmount = calAmount(debtorCreditors, 'totalOutstanding');

  const debtorTurnover  = (debtorOutstandingAmount/ turnOver ) * 100;

  const row = Mapper(
    smeLoanRequest,
    creditRiskParameterType,
    debtorOutstandingAmount,
    'debt-form');

  row.turnover = debtorTurnover;

  return row;
};

module.exports = { generate };