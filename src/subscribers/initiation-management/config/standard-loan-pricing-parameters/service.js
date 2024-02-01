const axios = require('@src/axios');

const { Config } = require('@config');

const { baseUrl } = Config.INITIATION_MANAGEMENT;

const bankURL = `${baseUrl}/config/standard-loan-pricing-parameters`;

const getStandardLPP = async (params) => {

  const url = `${bankURL}/query/one`;

  const result = await axios.get(url, {
    params: params
  });

  return result.data;
};

module.exports = {

  getStandardLPP
};