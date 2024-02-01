const axios = require('@src/axios');

const { Config } = require('@config');

const { to, TE } = require('@src/helper');

const { baseUrl } = Config.CRM_MANAGEMENT;

const bankURL = `${baseUrl}/platform-parameters`;

const customerURL = `${baseUrl}/customers`;

const getCustomer = async (params, config) => {

  const url = `${bankURL}/query/one`;

  const [err, result] = await to(axios.get(url, {
    params: params,
    ...config
  }));

  if (err) {
    const error = { error: err };
    Error.captureStackTrace(error);
    TE(error);
  }

  if (!result || !result.data) {
    const error = { error: 'Customer not found' };
    Error.captureStackTrace(error);
    TE(error);
  }

  return result.data;
};

const getCustomerList = async (params, config) => {

  const url = `${bankURL}/query`;

  const [err, result] = await to(axios.get(url, {
    params: params,
    ...config
  }));

  if (err) {
    const error = { error: err };
    Error.captureStackTrace(error);
    TE(error);
  }

  return result.data;
};

const getCustomerForPsd2Data = async (params, config) => {

  const url = `${customerURL}/query/one`;

  const [err, result] = await to(axios.get(url, {
    params: params,
    ...config
  }));

  if (err) {
    const error = { error: err };
    Error.captureStackTrace(error);
    TE(error);
  }

  if (!result || !result.data) {
    const error = { error: 'Customer not found' };
    Error.captureStackTrace(error);
    TE(error);
  }

  return result.data;
};

module.exports = {

  getCustomer,

  getCustomerList,

  getCustomerForPsd2Data
};