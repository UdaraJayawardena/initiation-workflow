const axios = require('../axios');

const { Config } = require('../../../../config');

const { baseUrl } = Config.CAMUNDA;

const taskBaseURL = `${baseUrl}/process-instance`;

const processInstance = async (processDefinitionId,auth) => {

  const url = `${taskBaseURL}?processDefinitionId=${processDefinitionId}&active=${true}`;

  const result = await axios.get(url, {   
    auth
  });

  return result;
};

module.exports = {

  processInstance
};
