const axios = require('axios');

const { to, TE } = require('./helper');

const { injectHeader } = require('./tracer');

const ERROR = (err) => {

  if (!err.response) {

    return err.toString();
  }

  return err.response.data;
};

const injectHeaders = async (headers, headersKey) => {

  if (!headers) headers = {};

  return {

    ...headers,

    ...(await injectHeader(headersKey, headers))
  };
};

const HEADERS = async ({ headers, headersKey }) => ({

  'content-type': 'application/json',

  ...(await injectHeaders(headers,
    (headersKey ? headersKey : {}))),
});

const CONFIG = async (config) => {

  if (!config) config = {};

  config.headers = await HEADERS(config);

  if (config.headersKey) delete config.headersKey;

  return config;
};

const post = async (url, data, config) => {

  try {

    const [err, result] = await to(axios.default.post(url, data, await CONFIG(config)));

    if (err) TE(err);

    return result.data;
  } catch (err) {

    throw ERROR(err);
  }
};

const put = async (url, data, config) => {

  try {

    const [err, result] = await to(axios.default.put(url, data, await CONFIG(config)));

    if (err) TE(err);

    return result.data;
  } catch (err) {

    throw ERROR(err);
  }
};

const get = async (url, config) => {

  try {

    const [err, result] = await to(axios.default.get(url, await CONFIG(config)));

    if (err) TE(err);

    return result.data;
  } catch (err) {

    throw ERROR(err);
  }
};

const del = async (url, config) => {

  try {

    const [err, result] = await to(axios.default.delete(url, await CONFIG(config)));

    if (err) TE(err);

    return result.data;
  } catch (err) {

    throw ERROR(err);
  }
};

module.exports = {

  post,

  get,

  del,

  put,
};