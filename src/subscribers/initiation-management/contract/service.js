const axios = require('@src/axios');

const { Config } = require('@config');

const { baseUrl } = Config.INITIATION_MANAGEMENT;

const contractURL = `${baseUrl}/contracts`;

const createContract = async (data, headerToken) => {

  const result = await axios.post(`${contractURL}/actions`,
    data, headerToken);

  return result.data;
};

const generateContract = async (contractId, customer, headerToken) => {

  const result = await axios.post(contractURL + '/generate-contract',
    { contractId, customer }, headerToken);

  return result.data;
};

const updateContract = async (data, headerToken) => {

  const result = await axios.post(`${contractURL}/update`,
    data, headerToken);

  return result.data;
};

const deleteExistContractsAndContractparties = async (contractId, headerToken) => {

  const result = await axios.post(`${baseUrl}/delete-contract-and-contract-parties`,
    { contractId: contractId }, headerToken);

  return result.data;
};

module.exports = {
  createContract,
  updateContract,
  generateContract,
  deleteExistContractsAndContractparties
};