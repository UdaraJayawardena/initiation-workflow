const axios = require('../axios');

const { Config } = require('../../../../config');

const _auth = { auth: Config.CAMUNDA.auth };

const { baseUrl } = Config.CAMUNDA;

const taskBaseURL = `${baseUrl}/tenant`;

const getList = async (params) => {

  const result = await axios
    .get(`${taskBaseURL}`, { params: params, ..._auth });

  return result;
};

const create = async (data) => {

  const result = await axios
    .post(`${taskBaseURL}/create`, data, _auth);

  return result;
};

// const update = async (id, data) => {

//   const result = await axios
//     .put(`${taskBaseURL}/${id}/profile`, {
//       id: data.id,
//       firstName: data.firstName,
//       lastName: data.lastName,
//       email: data.email
//     }, _auth);

//   return result;
// };

const del = async (id) => {

  const result = await axios
    .del(`${taskBaseURL}/${id}`, _auth);

  return result;
};

const createGroup = async (id, groupId) => {

  const result = await axios
    .put(`${taskBaseURL}/${id}/group-members/${groupId}`, {}, _auth);

  return result;
};

// const unlock = async (id) => {

//   const result = await axios
//     .post(`${taskBaseURL}/${id}/unlock`, _auth);

//   return result;
// };

module.exports = {

  getList,

  create,

  // update,

  del,

  createGroup

  // unlock
};
