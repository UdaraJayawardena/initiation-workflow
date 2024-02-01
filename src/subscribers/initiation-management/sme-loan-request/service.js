const axios = require('@src/axios');

const { Config } = require('@config');

const { baseUrl } = Config.INITIATION_MANAGEMENT;

const smeLoanRequestURL = `${baseUrl}/sme-loan-requests`;

const createSmeLoanRequest = async (data, headerToken) => {

  const result = await axios.post(`${smeLoanRequestURL}/actions`,
    data, headerToken);

  return result.data;
};

const updateSmeLoanRequest = async (data, headerToken) => {

  const result = await axios.put(`${smeLoanRequestURL}`,
    data, headerToken);

  return result.data;
};

const getSmeLoanRequest = async (data, headerToken) => {

  const result = await axios.get(`${smeLoanRequestURL}/query/one`, {
    ...headerToken,
    params: data
  });

  return result.data;
};

module.exports = {
  createSmeLoanRequest,

  updateSmeLoanRequest,

  getSmeLoanRequest
};