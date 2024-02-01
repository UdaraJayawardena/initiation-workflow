const axios = require('../../../axios');

const { Config } = require('../../../../config');

const { baseUrl } = Config.CRM_MANAGEMENT;

const personsAPI = `${baseUrl}/persons`;

const cudPerson = async (data, headerToken) => {

  const result = await axios.post(`${personsAPI}/actions`, data, headerToken);
  return result.data;
};

module.exports = {
  cudPerson,
};