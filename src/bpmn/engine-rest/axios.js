const axios = require('axios');

const { to, TE } = require('../../helper');

const ERROR = (err) => {

  if (!err.response) {

    return err.toString();
  }

  if(err.response.data) return err.response.data;

  if(err.message) return err.message;
};

const HEADERS = ({ headers }) => ({

  'content-type': 'application/json',

  ...headers
});

// const AUTH = (user) => ({ 
//   username: user.userName, 
//   password: user.camundaPassword 
// });

const CONFIG = (config) => {

  if (!config) config = {};

  // if(config.user) {

  // config.auth = AUTH(config.user);
  // }

  config.headers = HEADERS(config);

  return config;
};

const post = async (url, data, config) => {

  try {

    const [err, result] = await to(axios.default.post(url, data, CONFIG(config)));

    if (err) TE(err);

    return result.data;
  } catch (err) {

    throw ERROR(err);
  }
};

const put = async (url, data, config) => {

  try {

    const [err, result] = await to(axios.default.put(url, data, CONFIG(config)));

    if (err) TE(err);

    return result.data;
  } catch (err) {

    throw ERROR(err);
  }
};

const get = async (url, config) => {

  try {

    const [err, result] = await to(axios.default.get(url, CONFIG(config)));

    if (err) TE(err);

    return result.data;
  } catch (err) {

    throw ERROR(err);
  }
};

const del = async (url, config) => {

  try {

    const [err, result] = await to(axios.default.delete(url, CONFIG(config)));

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