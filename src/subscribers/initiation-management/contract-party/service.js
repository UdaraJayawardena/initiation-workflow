const axios = require('@src/axios');

const { Config } = require('@config');

const { baseUrl } = Config.INITIATION_MANAGEMENT;

const contractPartyURL = `${baseUrl}/contract-parties`;

const createContractParty = async (data, headerToken) => {

  const result = await axios.post(`${contractPartyURL}/actions`,
    data, headerToken);

  return result.data;
};

module.exports = {
  createContractParty
};