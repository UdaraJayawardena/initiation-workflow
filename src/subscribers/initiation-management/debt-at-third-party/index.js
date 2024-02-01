const {
  createDebtAtThirdParty,
  updateDebtAtThirdParty,
  deleteDebtAtThirdParty
} = require('./subscriber');
  
module.exports = {
  
  subscribe: async (client) => {

    await client.subscribe('create-debt-at-third-party', createDebtAtThirdParty);

    await client.subscribe('update-debt-at-third-party', updateDebtAtThirdParty);
  
    await client.subscribe('delete-debit-at-third-party', deleteDebtAtThirdParty);
  }
};