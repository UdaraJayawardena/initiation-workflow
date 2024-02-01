const Mapper = require('./mapper');

const generate = async (
  task,
  smeLoanRequest,
  creditRiskParameterType,
  smeLoanRequestBlock,
  bankTransactions,
  debtorsCreditors
) => {

  const filteredBts = bankTransactions.filter((bankTransactions) =>
    bankTransactions.category === 'EXPENSES'
    && bankTransactions.sub_category === 'TAXES'
    && parseFloat(bankTransactions.amount)%100 === 0);

  const { preDebtsAtThirdParty } = debtorsCreditors;

  const debtAtThirdParties = preDebtsAtThirdParty.filter((debtsAtThirdParty) =>
    debtsAtThirdParty.debtType === 'tax-payment-overdue');

  let taxDebtSelfReported = 'No';

  if(debtAtThirdParties.length > 0 )taxDebtSelfReported = 'Yes';

  const row = Mapper(
    smeLoanRequest,
    creditRiskParameterType,
    taxDebtSelfReported,
    'bank-account');

  row.bankTransactionId = filteredBts.map(bt => bt.id);

  return row;
};

module.exports = { generate };