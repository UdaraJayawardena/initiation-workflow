const axios = require('@src/axios');

const { Config } = require('@config');

const { baseUrl } = Config.INITIATION_MANAGEMENT;

const bankURL = `${baseUrl}/config/loan-purpose-risk-parameters`;

const getLoanPurposeRPList = async (params) => {

  const url = `${bankURL}/query`;

  const result = await axios.get(url, {
    params: params
  });

  return result.data;
};

module.exports = {

  getLoanPurposeRPList
};