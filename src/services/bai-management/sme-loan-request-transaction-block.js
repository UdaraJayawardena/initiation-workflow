const axios = require('@src/axios');

const { to, TE } = require('@src/helper');

const { Config } = require('@config');

const BankTransactionBaseUrl = `${Config.BAI_MANAGEMENT.baseUrl}/sme-loan-request-block`;

const getSmeLoanRequestBlocks = async (data, config) => {

  const [err, result] = await to(axios
    .post(`${BankTransactionBaseUrl}/query`,data, config));

  if (err) {
    const error = { error: err };
    Error.captureStackTrace(error);
    TE(error);
  }
  
  return result.data;
};

const updateSmeLoanRequestBlocks = async (id, data, config) => {

  const [err, result] = await to(axios
    .put(`${BankTransactionBaseUrl}/id/${id}`,data, config));

  if (err) {
    const error = { error: err };
    Error.captureStackTrace(error);
    TE(error);
  }
  
  return result.data;
};

module.exports = {

  getSmeLoanRequestBlocks,

  updateSmeLoanRequestBlocks
};