const axios = require('../axios');

const { Config } = require('../../../../config');

const { baseUrl } = Config.CAMUNDA;

const taskBaseURL = `${baseUrl}/migration`;
const baseUrlPD = `${baseUrl}`;

const generate = async (bodyData,auth) => {

  const url = `${taskBaseURL}/generate`;

  const result = await axios.post(url, bodyData,{    
    auth
  });

  return result;
};

const validate = async (bodyData,auth) => {

  const result = await axios.post(`${taskBaseURL}/validate`,bodyData,{ auth });

  return result;
};

const execute = async (dataObj, auth) => {

  const result = await axios.post(`${taskBaseURL}/execute`, dataObj, { auth });

  return result;
};

const getProcessDefinitions = async (auth) => {

  const url = `${baseUrlPD}/process-definition`;

  const result = await axios.get(url, { auth });

  return result;
};

const getProcessDefinitionsByKey= async (params, auth) => {

  const url = `${baseUrlPD}/process-definition${params}`;

  const result = await axios.get(url, { auth });

  return result;
};


module.exports = {

  generate,

  validate,
  
  execute,

  getProcessDefinitions,

  getProcessDefinitionsByKey
  
};
