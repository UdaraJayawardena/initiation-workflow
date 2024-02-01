const axios = require('@src/axios');

const { Config } = require('@config');

const { baseUrl } = Config.INITIATION_MANAGEMENT;

const bankURL = `${baseUrl}/credit-risk-parameters`;

const getCreditRiskParameterList = async (params, headerToken) => {

  const url = `${bankURL}/query`;

  const result = await axios.get(url, {
    params: params,
    headerToken
  });

  return result.data;
};

const createCreditRiskParameterList = async (data, headerToken) => {

  const url = `${bankURL}/bulk`;

  const result = await axios.post(url, data, {
    headerToken
  });

  return result.data;
};

module.exports = {

  getCreditRiskParameterList,
  createCreditRiskParameterList
};