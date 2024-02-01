const axios = require('@src/axios');

const { to, TE } = require('@src/helper');

const { Config } = require('@config');

const InversPSD2BaseUrl = `${Config.BAI_MANAGEMENT.baseUrl}/invers-psd2`;


const getInversConsentInformation = async (data, config) => {

  const [err, result] = await to(axios.post(`${InversPSD2BaseUrl}/consent-information`, data, config));

  if (err) {
    const error = { error: err };
    Error.captureStackTrace(error);
    TE(error);
  }
  
  return result.data;
};


const getPSD2Transactions = async (data, config) => {

  const [err, result] = await to(axios.post(`${InversPSD2BaseUrl}/transactions`, data, config));

  if (err) {
    const error = { error: err };
    Error.captureStackTrace(error);
    TE(error);
  }
  
  return result.data;
};

const storePSD2Data = async (data, config) => {

  const [err, result] = await to(axios.post(`${InversPSD2BaseUrl}/save-psd2-file`, data, config));

  if (err) {
    const error = { error: err };
    Error.captureStackTrace(error);
    TE(error);
  }
  
  return result.data;
};

module.exports = {
  getInversConsentInformation,
  getPSD2Transactions,
  storePSD2Data
};