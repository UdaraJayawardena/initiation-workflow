const axios = require('@src/axios');

const { Config } = require('@config');

const CamundaClientUrl = `${Config.CAMUNDA_CLIENT.baseUrl}`;

const getHistoryProcessInstances = async (query, headerToken) => {

  const result = await axios.get(`${CamundaClientUrl}/history/process-instances`, {
    ...headerToken,
    params: query
  });

  return result.data;
};

module.exports = {

  getHistoryProcessInstances
};