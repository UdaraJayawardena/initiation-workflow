const {
  updateRequestProposal,
  getRequestProposal
} = require('./subscriber');

module.exports = {

  subscribe: async (client) => {

    await client.subscribe('update-sme-loan-request-proposal', updateRequestProposal);

    await client.subscribe('get-sme-loan-request-proposal', getRequestProposal);
  }
};