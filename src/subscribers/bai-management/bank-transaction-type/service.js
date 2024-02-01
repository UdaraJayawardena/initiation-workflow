const axios = require('@src/axios');

const { Config } = require('@config');

const { baseUrl } = Config.BAI_MANAGEMENT;

const bankTransactionTypeURL = `${baseUrl}/bank-transaction-type`;

const createNewBankTransactionType = async (data, headerToken) => {

  const result = await axios.post(`${bankTransactionTypeURL}/`,
    data, headerToken);

  return result.data;
};

const updateBankTransactionType = async (data, headerToken) => {

  const result = await axios.put(`${bankTransactionTypeURL}/`,
    data, headerToken);

  return result.data;
};

const deleteExistingBankTransactionType = async (typeId, headerToken) => {

  const result = await axios.del(`${bankTransactionTypeURL}/byId/${typeId}`,
    headerToken);

  return result.data;
};

const getBankTransactionTypeByBankId = async (bankId, headerToken) => {

  const result = await axios.get(`${bankTransactionTypeURL}/bankTransactionTypeBYBankId/${bankId}`,
    headerToken);
  
  return result.data;
};

module.exports = {
  createNewBankTransactionType,

  updateBankTransactionType,

  deleteExistingBankTransactionType,

  getBankTransactionTypeByBankId
};