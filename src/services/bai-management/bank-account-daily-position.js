const axios = require('@src/axios');

const { to, TE } = require('@src/helper');

const { Config } = require('@config');

const BankTransactionBaseUrl = `${Config.BAI_MANAGEMENT.baseUrl}/bank-account-daily-position`;

const getBankAccountDailyPosition = async (data, headerToken) => {

  const [err, result] = await to(axios
    .post(`${BankTransactionBaseUrl}/query`, data, headerToken));

  if (err) {
    const error = { error: err };
    Error.captureStackTrace(error);
    TE(error);
  }

  return result.data;
};

module.exports = {

  getBankAccountDailyPosition,
};