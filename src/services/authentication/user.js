const axios = require('@src/axios');

const { Config } = require('@config');

const { to, TE } = require('@src/helper');

const { baseUrl } = Config.AUTHENTICATION;

const userURL = `${baseUrl}/user`;


const getUserList = async (params, config) => {

  const url = `${userURL}`;

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

  getUserList
};