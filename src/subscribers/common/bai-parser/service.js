const axios = require('@src/axios');

const qs = require('qs');

// const { to, TE } = require('@src/helper');

const { Config } = require('@config');

const { baseUrl } = Config.BAI_PARSER;

const { psd2ParserBaseUrl } = Config.PSD2_PARSER;


const addSmeLoanRequest = async (data) => {

  const url = `${baseUrl}/sme-loan-request/add`;

  const result = await axios.post(url, qs.stringify(data), {
    headers: { 'content-type': 'application/x-www-form-urlencoded' }
  });

  return result;
};


const passPSD2BankTransaction = async (data, headerToken) => {

  const url = `${psd2ParserBaseUrl}/sme-loan-request/add`;

  const result = await axios.post( url, data, headerToken );

  return result.data;
};

module.exports = {

  addSmeLoanRequest,

  passPSD2BankTransaction
};