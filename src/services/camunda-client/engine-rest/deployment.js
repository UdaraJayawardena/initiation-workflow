const axios = require('axios');

const { getBaseUrl } = require('../../util');

const { CAMUNDA } = require('@config').Config;

const baseUrl = getBaseUrl('CAMUNDA_CLIENT').replace('/v1', '');

const getDeployments = async (query) => {

  console.log('getDeployments', baseUrl);

  const result = await axios.default.get(`${baseUrl}/engine-rest/deployment`, {
    auth: CAMUNDA.auth,
    params: {
      sortBy: 'deploymentTime',
      sortOrder: 'asc',
      ...query
    }
  });

  return result.data;
};

const deleteDeployment = async (id, query) => {

  const result = await axios.default.delete(`${baseUrl}/engine-rest/deployment/${id}`, {
    auth: CAMUNDA.auth,
    params: query
  });

  return result.data;
};

module.exports = {

  getDeployments,

  deleteDeployment
};