const {
  createContract,
  updateContract,
  generateContractHtml,
  deleteExistContractsAndContractparties
} = require('./subscriber');

module.exports = {

  subscribe: async (client) => {

    await client.subscribe('create-contract', createContract);
    await client.subscribe('update-contract', updateContract);
    await client.subscribe('generate-contract-html', generateContractHtml);
    await client.subscribe('delete-contract-and-contractparty-if-exist', deleteExistContractsAndContractparties);
  }
};