const {
  createDebtorCreditor,
  updateDebtorCreditor,
  deleteDebtorCreditor
} = require('./subscriber');
  
module.exports = {
  
  subscribe: async (client) => {

    await client.subscribe('create-debtor-creditor', createDebtorCreditor);

    await client.subscribe('update-debtor-creditor', updateDebtorCreditor);
  
    await client.subscribe('delete-debtor-creditor', deleteDebtorCreditor);
  }
};