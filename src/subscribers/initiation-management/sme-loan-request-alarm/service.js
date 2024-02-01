const axios = require('@src/axios');

const { Config } = require('@config');

const { baseUrl } = Config.INITIATION_MANAGEMENT;

const requestProposalURL = `${baseUrl}/sme-loan-request-alarm`;

const addSmeLoanRequestAlarm = async (data, headerToken) => {

  const result = await axios.post(`${requestProposalURL}/add-multiple`, data, headerToken);

  return result.data;
};


module.exports = {
  addSmeLoanRequestAlarm
};