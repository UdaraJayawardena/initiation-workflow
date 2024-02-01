const axios = require('@src/axios');

const { Config } = require('@config');

const BankAccountBaseUrl = `${Config.BAI_MANAGEMENT.baseUrl}/bank-accounts`;

const createBankAccount = async (data, headerToken) => {

  const result = await axios.post(`${BankAccountBaseUrl}`,
    data, headerToken);

  return result.data;
};

const updateBankAccount = async (data, headerToken) => {

  const result = await axios.put(`${BankAccountBaseUrl}`,
    data, headerToken);
  
  return result.data;
};

const deleteBankAccount = async (data, headerToken) => {

  const result = await axios.put(`${BankAccountBaseUrl}`,
    data, headerToken);
  
  return result.data;
};


module.exports = {
  createBankAccount,
  updateBankAccount,
  deleteBankAccount
};