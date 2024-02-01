const axios = require('@src/axios');

const { Config } = require('@config');

const { to, TE } = require('@src/helper');

const { baseUrl } = Config.INITIATION_MANAGEMENT;

const bankURL = `${baseUrl}/config/platform-parameters`;

const getPlatformParameterList = async (params, config) => {

  const url = `${bankURL}/query`;

  const [err, result] = await to(axios.get(url, {
    params: params,
    ...config
  }));

  if (err) {
    const error = { error: err };
    Error.captureStackTrace(error);
    TE(error);
  }

  return result.data;
};

module.exports = {

  getPlatformParameterList
};