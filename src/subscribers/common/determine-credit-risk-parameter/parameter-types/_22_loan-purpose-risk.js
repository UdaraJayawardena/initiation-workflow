const Mapper = require('./mapper');

const generate = async (
  task,
  smeLoanRequest,
  creditRiskParameterType,
) => {

  const loanPurposeRisk = smeLoanRequest.loanPurposeRisk;

  return Mapper(
    smeLoanRequest,
    creditRiskParameterType,
    loanPurposeRisk,
    'loan-request');
};

module.exports = { generate };