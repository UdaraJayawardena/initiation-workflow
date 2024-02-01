const axios = require('@src/axios');

const { Config } = require('@config');

const { baseUrl } = Config.INITIATION_MANAGEMENT;

const debitAtThirdPartyURL = `${baseUrl}/debt-at-third-party`;

const createDebtAtThirdParty = async (data, headerToken) => {

  const result = await axios.post(`${debitAtThirdPartyURL}`,
    data, headerToken);

  return result.data;
};

const updateDebtAtThirdParty = async (data, headerToken) => {

  const result = await axios.put(`${debitAtThirdPartyURL}`,
    data, headerToken);
  
  return result.data;
};

const deleteDebtAtThirdParty = async (data, headerToken) => {

  const result = await axios.del(`${debitAtThirdPartyURL}/key/${data.id}`, headerToken);
  
  return result.data;
};

module.exports = {
  createDebtAtThirdParty,

  updateDebtAtThirdParty,

  deleteDebtAtThirdParty
};