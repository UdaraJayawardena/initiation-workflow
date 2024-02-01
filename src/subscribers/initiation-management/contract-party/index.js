const {
  createContractParty,
  createOtherContractParties
} = require('./subscriber');

module.exports = {

  subscribe: async (client) => {

    await client.subscribe('create-contract-party', createContractParty);

    await client.subscribe('create-other-contract-parties', createOtherContractParties);
  }
};