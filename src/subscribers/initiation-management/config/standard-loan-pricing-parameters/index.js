const { bindStandardLPPByParams } = require('./subscriber');
  
module.exports = {
  
  subscribe: async (client) => {
    // standard-loan-pp: standard-loan-pricing-parameter
    await client.subscribe('bind-standard-loan-pp-by-params', bindStandardLPPByParams);
  }
};