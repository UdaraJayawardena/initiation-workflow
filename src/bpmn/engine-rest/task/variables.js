const axios = require('../axios');

const { Config } = require('../../../../config');

const { baseUrl } = Config.CAMUNDA;

const taskBaseUrl = `${baseUrl}/task`;

const get = () => {
  //
};

const getBinary = () => {
  //
};

const getList = async (id, params, auth) => {

  const url = `${taskBaseUrl}/${id}/variables`;

  const result = await axios.get(url, {
    params: params,
    auth
  });

  return result;
};

module.exports = {
  get,
  getBinary,
  getList
};