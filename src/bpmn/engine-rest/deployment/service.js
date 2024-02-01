const axios = require('../axios');

const { Config } = require('../../../../config');

const { baseUrl } = Config.CAMUNDA;

const deploymentBaseURL = `${baseUrl}/deployment`;

const get = async (id, auth) => {
  const url = `${deploymentBaseURL}/${id}`;

  const result = await axios.get(url, {
    auth
  });

  return result;
};

const getListCount = async (params, auth) => {
  const url = `${deploymentBaseURL}/count`;

  const result = await axios.get(url, {
    params: params,
    auth
  });

  return result;
};

const getList = async (params, auth) => {

  const url = `${deploymentBaseURL}`;

  const result = await axios.get(url, {
    params: params,
    auth
  });

  return result;
};

const create = async (form, auth) => {

  const url = `${deploymentBaseURL}/create`;

  const result = await axios.post(url, form, {
    headers: form.getHeaders(),
    auth
  });

  return result;
};

const redeploy = async (id, data ,auth) => {

  const url = `${deploymentBaseURL}/${id}/redeploy`;

  const result = await axios.post(url, data, {
    auth
  });

  return result;
};

const getResources = async (id, auth) => {

  const url = `${deploymentBaseURL}/${id}/resources`;

  const result = await axios.get(url, {
    auth
  });

  return result;
};

const getResource = async (id, resourceId, auth) => {

  const url = `${deploymentBaseURL}/${id}/resources/${resourceId}`;

  const result = await axios.get(url, {
    auth
  });

  return result;
};

const del = async (id, params, auth) => {

  const url = `${deploymentBaseURL}/${id}`;

  const result = await axios.del(url, {
    params: params,
    auth
  });

  return result;
};

// const getListPost = async () => {

// const url = `${TaskBaseUrl}/${id}/variables`;

// const result = await axios.get(url, {
//   params: queryParams
// });

// return result;
// };

module.exports = {
  get,
  getListCount,
  getList,
  // getListPost,
  create,
  redeploy,
  getResources,
  getResource,
  del
};