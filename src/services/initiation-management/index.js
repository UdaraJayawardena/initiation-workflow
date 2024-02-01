const CreditRiskParameterType = require('./credit-risk-parameter-type');
const CreditRiskParameter = require('./credit-risk-parameter');
const DebtorCreditor = require('./debtor-creditor');
const PlatformParameter = require('./platform-parameter');
const SmeLoanRequest = require('./sme-loan-request');
const StandardLoanPricingParameter = require('./standard-loan-pricing-parameter');

module.exports = {
  SmeLoanRequestService: SmeLoanRequest,
  DebtorCreditor: DebtorCreditor,
  CreditRiskParameterTypeService: CreditRiskParameterType,
  PlatformParameterService: PlatformParameter,
  CreditRiskParameterService: CreditRiskParameter,
  StandardLoanPricingParameterService: StandardLoanPricingParameter
};