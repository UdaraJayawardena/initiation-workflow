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

  const revenueBts = bankTransactions.filter((bankTransactions) =>
    bankTransactions.sub_category === 'REVENUE');

  let detailCategoryBts= bankTransactions.filter((bankTransactions) =>
    bankTransactions.detailed_category === 'PIN'
    || bankTransactions.detailed_category === 'PAYMENT SERVICE PROVIDER');

  let numberOfDifferentCustomers = detailCategoryBts.length;
  let turnOverOf3BiggestCustomers = 0;

  if(numberOfDifferentCustomers > revenueBts.length/2){
    const largest3AmountsBts = detailCategoryBts
      .sort((bt1, bt2) => parseFloat(bt2.amount) - parseFloat(bt1.amount))
      .filter((bt, index) => index < 3);
    turnOverOf3BiggestCustomers = calAmount(largest3AmountsBts);
  }else{
    
    detailCategoryBts = bankTransactions.filter((bankTransactions) =>
      bankTransactions.detailed_category === 'INVOICE'
      || bankTransactions.detailed_category === 'THIRD PARTY');
    
    const uniqueCounterPartyIban= [ ...new Set(detailCategoryBts.map(bt => bt.counterparty_iban_number)) ];
    numberOfDifferentCustomers = uniqueCounterPartyIban.length;
    
    const allAmounts = [];
    uniqueCounterPartyIban.forEach( counterPartyIban => {
      const customerBts = detailCategoryBts.filter( bt => bt.counterparty_iban_number === counterPartyIban);
      allAmounts.push({ amount: calAmount(customerBts) });
    });
    const largest3Amounts = allAmounts.filter((amount, index) => index < 3);
    turnOverOf3BiggestCustomers = calAmount(largest3Amounts);
  }

  const row = Mapper(
    smeLoanRequest,
    creditRiskParameterType,
    numberOfDifferentCustomers,
    'bank-account');

  row.bankTransactionId = detailCategoryBts.map(bt => bt.id);

  row.turnover = (turnOverOf3BiggestCustomers / turnOver) * 100;

  return row;
};

module.exports = { generate };