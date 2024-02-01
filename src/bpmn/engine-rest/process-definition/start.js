const axios = require('../axios');

const { Config } = require('../../../../config');

const { baseUrl } = Config.CAMUNDA;

const definitionBaseURL = `${baseUrl}/process-definition`;

const startByKey = async ({ key, businessKey, variables }, auth) => {

  const result = await axios.post(`${definitionBaseURL}/key/${key}/start`, {
    variables,
    businessKey
  }, { auth });

  return result;
};


const startById = async ({ id, data }, auth) => {

  const result = await axios.post(`${definitionBaseURL}/${id}/start`, data, { auth });

  return result;
};

const startByKeyForTenant = async ({ key, tenantId, data }, auth) => {

  const result = await axios
    .post(`${definitionBaseURL}/key/${key}/tenant-id/${tenantId}/start`, data, { auth });

  return result;
};

module.exports = {
  startByKey,
  startById,
  startByKeyForTenant
};