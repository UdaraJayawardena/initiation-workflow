const {
  subscriberGetContractPartiesAccordingToContractId
} = require('./subscriber');

module.exports = {

  subscribe: async (client) => {
    await client.subscribe('get-contract-parties', subscriberGetContractPartiesAccordingToContractId);
  }
};