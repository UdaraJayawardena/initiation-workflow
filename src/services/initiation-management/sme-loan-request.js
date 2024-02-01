const axios = require('@src/axios');

const { Config } = require('@config');

const { to, TE } = require('@src/helper');

const { baseUrl } = Config.INITIATION_MANAGEMENT;

const smeLoanRequestURL = `${baseUrl}/sme-loan-requests`;

const createSmeLoanRequest = async (data, headerToken) => {

  const result = await axios.post(`${smeLoanRequestURL}/actions`,
    data, headerToken);

  return result.data;
};

const updateSmeLoanRequestBankruptInfo = async (data, headerToken) => {

  const result = await axios.put(`${smeLoanRequestURL}`,
    data, headerToken);

  return result.data;
};

const getSmeLoanRequest = async (params, config) => {

  const [err, result] = await to(axios.get(`${smeLoanRequestURL}/query/one`, {
    ...config,
    params: params
  }));

  if (err) {
    const error = { error: err };
    Error.captureStackTrace(error);
    TE(error);
  }

  if (!result || !result.data) {
    const error = { error: 'Sme-Loan-Request not found' };
    Error.captureStackTrace(error);
    TE(error);
  }

  return result.data;
};

const getSmeLoanRequestByCustomerId = async (params, config) => {

  const [ err, result] = await to(axios.get(`${smeLoanRequestURL}/query`, {
    ...config,
    params: params
  }));

  if (err) {
    const error = { error: err };
    Error.captureStackTrace(error);
    TE(error);
  }

  if (!result || !result.data) {
    const error = { error: 'Sme-Loan-Request not found' };
    Error.captureStackTrace(error);
    TE(error);
  }

  return result.data;
};

module.exports = {
  createSmeLoanRequest,

  updateSmeLoanRequestBankruptInfo,

  getSmeLoanRequest,

  getSmeLoanRequestByCustomerId
};