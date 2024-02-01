const axios = require('../axios');

const { Config } = require('../../../../config');

const _auth = { auth: Config.CAMUNDA.auth };

const { baseUrl } = Config.CAMUNDA;

const taskBaseURL = `${baseUrl}/group`;

const create = async (id, userId) => {

  const result = await axios
    .put(`${taskBaseURL}/${id}/members/${userId}`, {}, _auth);

  return result;
};

module.exports = {

  create
};
