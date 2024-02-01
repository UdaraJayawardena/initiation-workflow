const Mapper = require('./mapper');

const generate = async (
  task,
  smeLoanRequest,
  creditRiskParameterType,
) => {

  const dailyCollectionAmount = smeLoanRequest.desiredDirectDebitAmount;

  return Mapper(
    smeLoanRequest,
    creditRiskParameterType,
    dailyCollectionAmount,
    'loan-initiation');
};

module.exports = { generate };