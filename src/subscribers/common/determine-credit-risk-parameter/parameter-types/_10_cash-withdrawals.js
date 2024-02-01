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

  const filteredBts = bankTransactions.filter((bankTransactions) =>
    bankTransactions.category === 'EXPENSES'
    && bankTransactions.detailed_category === 'ATM');

  const totalCashWithdrawalsAmount = calAmount(filteredBts);

  const row = Mapper(
    smeLoanRequest,
    creditRiskParameterType,
    totalCashWithdrawalsAmount,
    'bank-account');

  row.bankTransactionId = filteredBts.map(bt => bt.id);

  row.turnover = (totalCashWithdrawalsAmount / turnOver) * 100;

  return row;
};

module.exports = { generate };