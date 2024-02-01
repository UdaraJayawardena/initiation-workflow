const axios = require('@src/axios');

const { Config } = require('@config');

const { baseUrl } = Config.INITIATION_MANAGEMENT;

const debtorCreditorURL = `${baseUrl}/debtor-creditor`;

const createDebtorCreditor = async (data, headerToken) => {

  const result = await axios.post(`${debtorCreditorURL}`,
    data, headerToken);

  return result.data;
};

const updateDebtorCreditor = async (data, headerToken) => {

  const result = await axios.put(`${debtorCreditorURL}`,
    data, headerToken);
  
  return result.data;
};

const deleteDebtorCreditor = async (data, headerToken) => {

  const result = await axios.del(`${debtorCreditorURL}/key/${data.id}`, headerToken);
  
  return result.data;
};

module.exports = {
  createDebtorCreditor,

  updateDebtorCreditor,

  deleteDebtorCreditor
};