const axios = require('@src/axios');

const { Config } = require('@config');

const { baseUrl } = Config.INITIATION_MANAGEMENT;

const bankURL = `${baseUrl}/config/credit-risk-parameter-types`;

const getCreditRiskPTList = async (params, headerToken) => {

  const url = `${bankURL}/query`;

  const result = await axios.get(url, {
    params: params,
    headerToken
  });

  return result.data;
};

module.exports = {

  getCreditRiskPTList
};