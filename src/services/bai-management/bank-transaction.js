const axios = require('@src/axios');

const { to, TE } = require('@src/helper');

const { Config } = require('@config');

const BankTransactionBaseUrl = `${Config.BAI_MANAGEMENT.baseUrl}/bank-transactions`;

const updateBankTransaction = async (bankTransaction, headerToken) => {

  const result = await axios.put(`${BankTransactionBaseUrl}`,
    bankTransaction, headerToken);
  
  return result.data;
};

const categorizeBankTransaction = async (data, headerToken) => {

  const result = await axios.post(`${BankTransactionBaseUrl}/categorize`,
    data, headerToken);
  
  return result.data;
};

const bankTransactionByBankId = async (bankId, headerToken) => {

  const result = await axios.get(`${BankTransactionBaseUrl}/bankTransactionByBankId/${bankId}`,
    headerToken);
  
  return result.data;
};

const getBankTransactions = async (data, config) => {

  const [err, result] = await to(axios.post(`${BankTransactionBaseUrl}/query/`, data, config));

  if (err) {
    const error = { error: err };
    Error.captureStackTrace(error);
    TE(error);
  }

  // if (!bankTransactions) {
  //   const error = { error: 'Bank-Transaction not found' };
  //   Error.captureStackTrace(error);
  //   TE(error);
  // }
  
  return result.data;
};

module.exports = {
  updateBankTransaction,
  categorizeBankTransaction,
  bankTransactionByBankId,
  getBankTransactions
};