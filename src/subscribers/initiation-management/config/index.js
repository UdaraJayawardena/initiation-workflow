const Banks = require('./banks');

const LoanPurposeRiskParameters = require('./loan-purpose-risk-parameters');

const PlatformParameters = require('./platform-parameters');

const StandardLoanPricingParameters = require('./standard-loan-pricing-parameters');

const CreditRiskParameterTypes = require('./credit-risk-parameter-types');

module.exports = {

  subscribe: async (client) => {

    await Banks.subscribe(client);

    await LoanPurposeRiskParameters.subscribe(client);

    await PlatformParameters.subscribe(client);

    await StandardLoanPricingParameters.subscribe(client);

    await CreditRiskParameterTypes.subscribe(client);
  }
};