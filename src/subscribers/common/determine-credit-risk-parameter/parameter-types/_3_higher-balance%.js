const { getToken } = require('@src/helper');

const { BaiManagementService } = require('@src/services');

const { BankAccountDailyPosition } = BaiManagementService;

const Mapper = require('./mapper');

const generate = async (
  task,
  smeLoanRequest,
  creditRiskParameterType,
  smeLoanRequestBlock,
) => {

  const dailyCollectionAmount = smeLoanRequest.desiredDirectDebitAmount;

  const bankAccountDailyPositions = await BankAccountDailyPosition.getBankAccountDailyPosition({
    action: 'GET',
    iban_number: smeLoanRequestBlock.iban_number,
    start_date: smeLoanRequestBlock.start_date,
    end_date: smeLoanRequestBlock.end_date
  }, getToken(task));

  const numberOfDaysWithHigherEndBalance = bankAccountDailyPositions
    .filter( bankAccountDailyPosition => bankAccountDailyPosition.balance_amount > dailyCollectionAmount).length;

  const higherBalance = bankAccountDailyPositions.length > 0 ? 
    (numberOfDaysWithHigherEndBalance / bankAccountDailyPositions.length) * 100 : 0;

  return Mapper(
    smeLoanRequest,
    creditRiskParameterType,
    higherBalance,
    'bank-account');
};

module.exports = { generate };