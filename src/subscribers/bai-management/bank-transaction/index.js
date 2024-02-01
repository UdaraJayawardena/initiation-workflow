const {
  updateBankTransaction,
  categorizeBankTransaction,
  getBankTransactionByBankId,
  verifyCategorization
} = require('./subscriber');
  
module.exports = {
  
  subscribe: async (client) => {
  
    await client.subscribe('bai-update-bank-transaction', updateBankTransaction);
    await client.subscribe('categorize-bank-transactions', categorizeBankTransaction);
    await client.subscribe('get-bank-transaction-by-bank-id',getBankTransactionByBankId);
    await client.subscribe('verify-categorization',verifyCategorization);
  }
};