/* eslint-disable no-unused-vars */
const axios = require('@src/axios');

const { Config } = require('@config');

const { baseUrl } = Config.INITIATION_API_GATEWAY;

const apiGatewayBaseUrl = `${baseUrl}/get-platform-parameters`;

const getPlatformParameters = async (params,headerToken) => {

  // const result = await axios.get(`${apiGatewayBaseUrl}?platformName=${platformName}`);
  // const result = await axios.get(`${apiGatewayBaseUrl}`);
  const result = await axios.get(apiGatewayBaseUrl, {
    ...headerToken,
    params: params
  });

  return result.data;
};

module.exports = {

  getPlatformParameters
};