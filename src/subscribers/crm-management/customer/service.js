const axios = require('../../../axios');

const { Config } = require('../../../../config');

const { baseUrl } = Config.CRM_MANAGEMENT;

const customersAPI = `${baseUrl}/customers`;

const cudCustomer = async (data, headerToken) => {

  const result = await axios.post(`${customersAPI}/actions`, data, headerToken);
  return result.data;
};

module.exports = {
  cudCustomer,
};