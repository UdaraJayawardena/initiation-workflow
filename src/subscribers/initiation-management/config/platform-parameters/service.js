const axios = require('@src/axios');

const { Config } = require('@config');

const { baseUrl } = Config.INITIATION_MANAGEMENT;

const platformParameterURL = `${baseUrl}/config/platform-parameters`;

const createPlatformParameter = async (platformParameter, headerToken) => {

  const result = await axios.post(`${platformParameterURL}`,
    platformParameter, headerToken);

  return result.data;
};

const updatePlatformParameter = async (platformParameter, headerToken) => {

  const result = await axios.put(`${platformParameterURL}`,
    platformParameter, headerToken);

  return result.data;
};

module.exports = {

  createPlatformParameter,

  updatePlatformParameter
};