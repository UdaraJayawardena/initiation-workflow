
const { DecimalConverts } = require('@src/utilities');

const { InitiationManagementService, BaiManagementService } = require('@src/services');

const { StandardLoanPricingParameterService } = InitiationManagementService;

const {  BankAccountDailyPosition } = BaiManagementService;

const _getStandardPercentage = async (smeLoanRequest, token) => {

  const { loanAmount, loanPurposeRisk } = smeLoanRequest;

  const standardPercentage = {
    standardInitialInterest: 0,
    standardRiskSurcharge: 0
  };

  const standardLoanPricingParameter = await StandardLoanPricingParameterService.getStandardLPP({
    amount: loanAmount,
    loanType: 'fixed-loan'
  }, token);

  if (!standardLoanPricingParameter) return standardPercentage;

  standardPercentage.standardInitialInterest = standardLoanPricingParameter[`${loanPurposeRisk}RiskInitialFeePercentage`];
  standardPercentage.standardRiskSurcharge = standardLoanPricingParameter[`${loanPurposeRisk}RiskSurchargePercentage`];

  return standardPercentage;
};

const checkExpectedDDAmount = async (smeLoanRequest, highestSmeLoanRequestBlocks, platformParameter, token) => {

  const expectedDDAmount = {
    expectedSuccessDDIndicator: '',
    aboveBalance: 0,
    calculatedExpectedLoanAmount: 0
  };

  const { desiredDirectDebitAmount } = smeLoanRequest;

  if (highestSmeLoanRequestBlocks.length <= 0) return expectedDDAmount;

  const smeLoanRequestBlock = highestSmeLoanRequestBlocks[0];

  const bankAccountDailyPositions = await BankAccountDailyPosition.getBankAccountDailyPosition({
    action: 'GET',
    iban_number: smeLoanRequestBlock.iban_number,
    start_date: smeLoanRequestBlock.start_date,
    end_date: smeLoanRequestBlock.end_date
  }, token);

  const totalNumberOfDaysAvailable = bankAccountDailyPositions.length;

  const totalNumberOfDaysAboveDesiredDDAmount = bankAccountDailyPositions
    .filter(bankAccountDailyPosition => bankAccountDailyPosition.balance_amount > desiredDirectDebitAmount).length;

  expectedDDAmount.aboveBalance = totalNumberOfDaysAvailable > 0 ?
    (totalNumberOfDaysAboveDesiredDDAmount / totalNumberOfDaysAvailable) * 100 : 0;

  if (expectedDDAmount.aboveBalance >= platformParameter.higherBalancePercentage) {
    expectedDDAmount.expectedSuccessDDIndicator = 'green';
    return expectedDDAmount;
  }

  let selectedRowCount = (platformParameter.higherBalancePercentage / 100) * totalNumberOfDaysAvailable;

  selectedRowCount = Math.round(selectedRowCount);

  let selectedDailyPositions = bankAccountDailyPositions.slice(0, selectedRowCount);

  selectedDailyPositions = selectedDailyPositions.sort((dp1, dp2) => dp1.balance_amount > dp2.balance_amount);

  const lowestDailyPositions = selectedDailyPositions[0];

  if (!lowestDailyPositions 
    || lowestDailyPositions.balance_amount < platformParameter.smallestLoanAmount) {
    expectedDDAmount.expectedSuccessDDIndicator = 'red';
    return expectedDDAmount;
  }

  const { standardInitialInterest, standardRiskSurcharge } = await _getStandardPercentage(smeLoanRequest, token);

  const expectedTotalLoanAmount = lowestDailyPositions.balance_amount * smeLoanRequest.numberOfDirectDebits;

  const calculatedTotalInterest = (standardInitialInterest + standardRiskSurcharge) * smeLoanRequest.desiredDurationInMonths;

  let calculatedExpectedLoanAmount = (expectedTotalLoanAmount / calculatedTotalInterest) * 100;

  calculatedExpectedLoanAmount = DecimalConverts.roundToNearestAny(calculatedExpectedLoanAmount, 500);

  expectedDDAmount.calculatedExpectedLoanAmount = calculatedExpectedLoanAmount;

  if (calculatedExpectedLoanAmount >= platformParameter.smallestLoanAmount) {

    expectedDDAmount.expectedSuccessDDIndicator = 'orange';
  } else {
    expectedDDAmount.expectedSuccessDDIndicator = 'red';
  }

  return expectedDDAmount;
};

module.exports = { checkExpectedDDAmount };