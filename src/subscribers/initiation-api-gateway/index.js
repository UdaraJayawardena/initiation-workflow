const ContractPartiesViaApiGate = require('./contract-parties');
const platformParameters = require('./platform-parameters');

module.exports = {

  subscribe: async (client) => {
    await ContractPartiesViaApiGate.subscribe(client);
    await platformParameters.subscribe(client);
  }
};