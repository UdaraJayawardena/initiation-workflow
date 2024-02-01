const axios = require('@src/axios');

const { Config } = require('@config');

const { to, TE } = require('@src/helper');

const { baseUrl } = Config.INITIATION_MANAGEMENT;

const bankURL = `${baseUrl}/config/standard-loan-pricing-parameters`;

const getStandardLPP = async (params, config) => {

  const url = `${bankURL}/query/one`;

  const [err, result] = await to(axios.get(url, {
    ...config,
    params: params
  }));

  if (err) {
    const error = { error: err };
    Error.captureStackTrace(error);
    TE(error);
  }

  return result.data;
};

module.exports = {

  getStandardLPP
};