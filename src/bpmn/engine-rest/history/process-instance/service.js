const axios = require('../../axios');

const { Config } = require('../../../../../config');

const { baseUrl } = Config.CAMUNDA;

const pIBaseUrl = `${baseUrl}/history/process-instance`;

const get = () => {
  //
};

const getList = async (params, auth) => {

  const url = `${pIBaseUrl}`;

  const result = await axios.get(url, {
    params: params,
    auth
  });

  return result;
};

const getListPost = async () => {

  // const url = `${TaskBaseUrl}/${id}/variables`;

  // const result = await axios.get(url, {
  //   params: queryParams
  // });

  // return result;
};

module.exports = {
  get,
  getList,
  getListPost,
};