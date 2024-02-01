const {
  createBankAccount,
  updateBankAccount,
  deleteBankAccount
} = require('./subscriber');
  
module.exports = {
  
  subscribe: async (client) => {
    await client.subscribe('update-bank-account', updateBankAccount);
    await client.subscribe('create-bank-account', createBankAccount);
    await client.subscribe('delete-bank-account', deleteBankAccount);
  }
};