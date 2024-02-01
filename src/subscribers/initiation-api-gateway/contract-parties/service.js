const axios = require('@src/axios');

const { Config } = require('@config');

const { baseUrl } = Config.INITIATION_API_GATEWAY;

const apiGatewayBaseUrl = `${baseUrl}/get-contract-parties`;

const getContractPartiesAccordingToContractId = async (params,headerToken) => {

  // const result = await axios.get(`${apiGatewayBaseUrl}?contractId=${contractId}`);

  const result = await axios.get(apiGatewayBaseUrl, {
    ...headerToken,
    params: params
  });

  return result.data;
};

module.exports = {

  getContractPartiesAccordingToContractId
};