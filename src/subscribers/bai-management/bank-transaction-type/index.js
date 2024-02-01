const {
  processBankTransactionTypeSubscriber
} = require('./subscriber');
  
module.exports = {
  
  subscribe: async (client) => {
  
    await client.subscribe('process-bank-transaction-types', processBankTransactionTypeSubscriber);
  
  }
};