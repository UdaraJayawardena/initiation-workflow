const {
  getBank,
  bindBankBicCodes,
  updateBank
} = require('./subscriber');
  
module.exports = {
  
  subscribe: async (client) => {
  
    await client.subscribe('get-bank', getBank);

    await client.subscribe('bind-bank-bic-codes', bindBankBicCodes);

    await client.subscribe('update-bank', updateBank);
  }
};