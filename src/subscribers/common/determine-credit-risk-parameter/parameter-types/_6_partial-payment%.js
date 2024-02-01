const Mapper = require('./mapper');

const { calAmount, sumOfAllPartialPayments } = require('../utils');

const _partialPaymentsFilter = (bankTransactions) => bankTransactions.amount < 0;

const generate = async (
  task,
  smeLoanRequest,
  creditRiskParameterType,
  smeLoanRequestBlock,
  bankTransactions
) => {

  const allPayments = bankTransactions.filter(_partialPaymentsFilter);

  const [sumOfAllPayment, incomingResult, outgoingResult] = await Promise.all([
    calAmount(allPayments),
    sumOfAllPartialPayments(bankTransactions, 'incoming'),
    sumOfAllPartialPayments(bankTransactions, 'outgoing')
  ]);

  const sumOfAllPartialPayment = incomingResult.sumOfAll + outgoingResult.sumOfAll;

  const partialPayment = (sumOfAllPartialPayment / sumOfAllPayment) * 100;

  const row = Mapper(
    smeLoanRequest,
    creditRiskParameterType,
    partialPayment,
    'bank-account');

  row.bankTransactionId = allPayments.map(bt => bt.id);

  return row;
};

module.exports = { generate };