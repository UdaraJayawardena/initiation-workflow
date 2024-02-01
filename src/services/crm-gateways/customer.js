const axios = require('@src/axios');

const { to, TE } = require('@src/helper');

const { Config } = require('@config');

const { baseUrl } = Config.CRM_GATEWAY;

const getCustomerDetails = async (params, config) => {

  const url = `${baseUrl}/get-customer-details`;

  const [err, result] = await to(axios.get(url, {
    ...config,
    params: params
  }));

  if (err) {
    const error = { error: err };
    Error.captureStackTrace(error);
    TE(error);
  }

  return result.data;
};

module.exports = {

  getCustomerDetails,
};