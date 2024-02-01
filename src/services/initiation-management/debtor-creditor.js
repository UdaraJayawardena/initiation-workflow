const axios = require('@src/axios');

const { Config } = require('@config');

const { baseUrl } = Config.INITIATION_MANAGEMENT;

const bankURL = `${baseUrl}/debtor-creditor`;

const getDebtsAndDebtorsCreditors = async (params, headerToken) => {

  const url = `${bankURL}/getDebtsAndDebitorsCreditors`;

  const result = await axios.post(url, params, {headerToken});

  return result.data;
};

module.exports = {

  getDebtsAndDebtorsCreditors
};