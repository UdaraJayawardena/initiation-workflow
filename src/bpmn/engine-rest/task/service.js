const axios = require('../axios');

const { Config } = require('../../../../config');

const { baseUrl } = Config.CAMUNDA;

const taskBaseURL = `${baseUrl}/task`;

const getList = async (params, auth) => {

  const url = `${taskBaseURL}`;

  const result = await axios.get(url, {
    params: params,
    auth
  });

  return result;
};

const claim = async ({ id, userId }, auth) => {

  const data = {
    userId: userId
  };

  const result = await axios.post(`${taskBaseURL}/${id}/claim`, data, { auth });

  return result;
};

const complete = async ({ id, variables, withVariablesInReturn }, auth) => {

  const result = await axios.post(`${taskBaseURL}/${id}/complete`, {
    variables,
    withVariablesInReturn: withVariablesInReturn === true
  }, { auth });

  return result;
};

module.exports = {

  getList,

  claim,
  
  complete,
};
