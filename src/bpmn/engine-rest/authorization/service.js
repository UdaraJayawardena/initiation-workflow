const axios = require('../axios');

const { Config } = require('../../../../config');

const _auth = { auth: Config.CAMUNDA.auth };

const { baseUrl } = Config.CAMUNDA;

const taskBaseURL = `${baseUrl}/authorization`;

const get = async (id) => {

  const result = await axios
    .get(`${taskBaseURL}/${id}`, _auth);

  return result;
};

const getList = async (params) => {

  const result = await axios
    .get(`${taskBaseURL}`, {
      params: params,
      ..._auth
    });

  return result;
};

const create = async (data) => {

  const result = await axios
    .post(`${taskBaseURL}/create`, data, _auth);

  return result;
};

const update = async (id, data) => {

  const result = await axios
    .put(`${taskBaseURL}/${id}`, data, _auth);

  return result;
};

const del = async (id) => {

  const result = await axios
    .del(`${taskBaseURL}/${id}`, _auth);

  return result;
};

module.exports = {

  get,
  
  getList,

  create,

  update,

  del
};
