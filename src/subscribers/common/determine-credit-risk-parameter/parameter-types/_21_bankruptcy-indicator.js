const Mapper = require('./mapper');

const generate = async (
  task,
  smeLoanRequest,
  creditRiskParameterType,
) => {

  const bankruptIndicator = smeLoanRequest.bankruptIndicator;

  return Mapper(
    smeLoanRequest,
    creditRiskParameterType,
    bankruptIndicator,
    'debt-form');
};

module.exports = { generate };