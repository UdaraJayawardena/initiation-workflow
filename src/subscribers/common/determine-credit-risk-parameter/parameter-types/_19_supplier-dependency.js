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

  const costBts = bankTransactions.filter((bankTransactions) =>
    bankTransactions.sub_category === 'COSTS');

  let detailCategoryBts= bankTransactions.filter((bankTransactions) =>
    bankTransactions.detailed_category === 'PAY TERMINAL'
    || bankTransactions.detailed_category === 'ONLINE PAYMENT');

  let numberOfDifferentSuppliers = detailCategoryBts.length;
  let turnoverOf3BiggestSuppliers = 0;

  if(numberOfDifferentSuppliers > costBts.length/2){
    const largest3AmountsBt = detailCategoryBts
      .sort((bt1, bt2) => parseFloat(bt2.amount) - parseFloat(bt1.amount))
      .filter((bt, index) => index < 3);
    turnoverOf3BiggestSuppliers = calAmount(largest3AmountsBt);
  }else{

    detailCategoryBts = bankTransactions.filter((bankTransactions) =>
      bankTransactions.detailed_category === 'INVOICE'
      || bankTransactions.detailed_category === 'DEBET AUTHORIZATION');
    
    const uniqueCounterPartyIban= [ ...new Set(detailCategoryBts.map(bt => bt.counterparty_iban_number)) ];
    
    numberOfDifferentSuppliers = uniqueCounterPartyIban.length;
    const allAmounts = [];
    
    uniqueCounterPartyIban.forEach( counterPartyIban => {
      const customerBt = detailCategoryBts.filter( bt => bt.counterparty_iban_number === counterPartyIban);
      allAmounts.push({ amount: calAmount(customerBt) });
    });
    const largest3Amounts = allAmounts.filter((amount, index) => index < 3);
    turnoverOf3BiggestSuppliers = calAmount(largest3Amounts);
  }

  const row = Mapper(
    smeLoanRequest,
    creditRiskParameterType,
    numberOfDifferentSuppliers,
    'bank-account');

  row.bankTransactionId = detailCategoryBts.map(bt => bt.id);

  row.turnover = (turnoverOf3BiggestSuppliers / turnOver) * 100;

  return row;
};

module.exports = { generate };