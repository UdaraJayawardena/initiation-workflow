const {
  createCreditRiskParameterTypes,
  updateCreditRiskParameterTypes,
  deleteCreditRiskParameterTypes
} = require('./subscriber');
  
module.exports = {
  
  subscribe: async (client) => {
    await client.subscribe('update-credit-risk-parameter-types', updateCreditRiskParameterTypes);
    await client.subscribe('create-credit-risk-parameter-types', createCreditRiskParameterTypes);
    await client.subscribe('delete-credit-risk-parameter-types', deleteCreditRiskParameterTypes);
  }
};