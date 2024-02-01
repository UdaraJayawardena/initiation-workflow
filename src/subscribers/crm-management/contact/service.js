const axios = require('../../../axios');

const { Config } = require('../../../../config');

const { baseUrl } = Config.CRM_MANAGEMENT;

const ContactURL = `${baseUrl}/contacts`;

// const header = (reqId) => ({ headersKey: { reqId: reqId } });

const cudContact = async (data, headerToken) => {

  const result = await axios.post(`${ContactURL}/actions`, data, headerToken);

  return result.data;
};

const deleteContacts = async (data, headerToken) => {

  const result = await axios.post(`${ContactURL}/delete`, data, headerToken);

  return result.data;
};



module.exports = {
  cudContact,

  deleteContacts
};