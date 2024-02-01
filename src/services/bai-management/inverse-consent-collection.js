const axios = require('@src/axios');

const { Config } = require('@config');

const BaiManagementBaseUrl = Config.BAI_MANAGEMENT.baseUrl;


const updateConsentCollection = async (data, auth) => {

  const url = `${BaiManagementBaseUrl}/consent-collections/actions`;

  const result = await axios.post(url,
    data, auth
  );

  return result;
};

module.exports = {

  updateConsentCollection
};