const axios = require('@src/axios');

const { Config } = require('@config');

const { to, TE } = require('@src/helper');

const { baseUrl } = Config.AUTOMATED_ANALYSIS;

const uri = `${baseUrl}/first-analysis-indicators`;

const create = async (data, config) => {

  const [err, result] = await to(axios.post(uri, data, config));

  if (err) {
    const error = { error: err };
    Error.captureStackTrace(error);
    TE(error);
  }

  return result.data;
};

const findAll = async (params, config) => {

  const [err, result] = await to(axios.get(uri, {
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
  create,
  findAll,
};