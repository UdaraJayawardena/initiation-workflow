const axios = require('@src/axios');

const { Config } = require('@config');

const { baseUrl } = Config.INITIATION_MANAGEMENT;

const bankURL = `${baseUrl}/config/banks`;

const getBank = async (bicCode, headerToken) => {

  const result = await axios.get(`${bankURL}/query`, {
    ...headerToken,
    params: { bicCode: bicCode }
  });

  return result.data;
};

const getBankByIban = async (iban) => {

  const url = `${bankURL}/iban/${iban}`;

  const result = await axios.get(url);

  return result.data;
};

const createBank = async (bank, headerToken) => {

  const result = await axios.post(`${bankURL}`,
    bank, headerToken);

  return result.data;
};

const updateBank = async (bank, headerToken) => {

  const result = await axios.put(`${bankURL}`,
    bank, headerToken);

  return result.data;
};

module.exports = {

  getBank,

  getBankByIban,

  createBank,

  updateBank
};