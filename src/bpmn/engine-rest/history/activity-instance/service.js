const axios = require('../../axios');

const { Config } = require('../../../../../config');

const { baseUrl } = Config.CAMUNDA;

const ActivityInstanceBaseUrl = `${baseUrl}/history/activity-instance`;

const get = () => {
  //
};

const getList = async (params, auth) => {

  const url = `${ActivityInstanceBaseUrl}`;

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
  getListPost
};