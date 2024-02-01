const axios = require('@src/axios');

const { Config } = require('@config');

const BaiManagementBaseUrl = `${Config.BAI_MANAGEMENT.baseUrl}/invers-consent`;



const getConsentCollection = async (params, auth) => {

  const url = `${BaiManagementBaseUrl}/query`;  

  const result = await axios.get(url, {
    params: params,
    auth
  });

  return result;
};

const getConsentCollectionByStatus = async (params, auth) => {

  const url = `${BaiManagementBaseUrl}/by-status-for-psd2-daily-update`; 

  const result = await axios.get(url, {
    params: params,
    auth
  });

  return result;
};

const updateConsent = async (data, auth) => {

  const url = BaiManagementBaseUrl;

  const result = await axios.put(url,
    data, auth
  );

  return result;
};

module.exports = {

  getConsentCollection,

  getConsentCollectionByStatus,

  updateConsent
};