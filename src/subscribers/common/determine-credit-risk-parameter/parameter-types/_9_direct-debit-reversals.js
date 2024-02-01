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

  const directDebitReversalBts = bankTransactions.filter((bankTransactions) =>
    bankTransactions.internal_transaction_type === 'Direct Debit Reversal'
    && parseFloat(bankTransactions.amount) > 0);

  const directDebitReversalAmount = calAmount(directDebitReversalBts);

  const row = Mapper(
    smeLoanRequest,
    creditRiskParameterType,
    directDebitReversalAmount,
    'bank-account');

  row.bankTransactionId = directDebitReversalBts.map(bt => bt.id);

  row.turnover = (directDebitReversalAmount / turnOver) * 100;

  return row;
};

module.exports = { generate };