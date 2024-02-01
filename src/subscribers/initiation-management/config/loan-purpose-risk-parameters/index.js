const { bindLoanPurposeRPByParams } = require('./subscriber');
  
module.exports = {
  
  subscribe: async (client) => {
  
    await client.subscribe('bind-loan-purpose-risk-parameters-by-params', bindLoanPurposeRPByParams);
  }
};