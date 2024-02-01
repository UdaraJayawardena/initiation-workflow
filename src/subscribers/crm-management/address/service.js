const axios = require('../../../axios');

const { Config } = require('../../../../config');

const { baseUrl } = Config.CRM_MANAGEMENT;

const AddressURL = `${baseUrl}/addresses`;

// const header = (reqId) => ({ headersKey: { reqId: reqId } });

const updateAddress = async (data, headerToken) => {

  const result = await axios.post(`${AddressURL}/actions`, data, headerToken);

  return result.data;
};

const deleteAddress = async (data, headerToken) => {

  const result = await axios.post(`${AddressURL}/delete`, data, headerToken);

  return result.data;
};

module.exports = {
  updateAddress,

  deleteAddress
};