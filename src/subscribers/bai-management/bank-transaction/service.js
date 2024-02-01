const axios = require('@src/axios');

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

const publishMessageToCategorizeBankTransaction = async (data, headerToken) => {

  const result = await axios.post(`${BankTransactionBaseUrl}/publish-categorization`,
    data, headerToken);
  
  return result.data;
};

const bankTransactionByBankId = async (bankId, headerToken) => {

  const result = await axios.get(`${BankTransactionBaseUrl}/bankTransactionByBankId/${bankId}`,
    headerToken);
  
  return result.data;
};
module.exports = {

  updateBankTransaction,
  categorizeBankTransaction,
  bankTransactionByBankId,
  publishMessageToCategorizeBankTransaction
};