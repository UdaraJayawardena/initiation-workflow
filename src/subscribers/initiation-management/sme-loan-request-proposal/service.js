const axios = require('@src/axios');

const { Config } = require('@config');

const { baseUrl } = Config.INITIATION_MANAGEMENT;

const requestProposalURL = `${baseUrl}/sme-loan-request-proposals`;

const createRequestProposal = async (data, headerToken) => {

  const result = await axios.post(`${requestProposalURL}/actions`, data, headerToken);

  return result.data;
};

// const getRequestProposal = async (requestProposalId, headerToken) => {

//   const result = await axios.post(requestProposalURL, 
//     data, headerToken);

//   return result.data;
// }; 

const getRequestProposal = async (smeLoanRequestId, headerToken) => {

  const result = await axios.get(`${requestProposalURL}/query/one`, {
    ...headerToken,
    params: { id: smeLoanRequestId }
  });

  return result.data;
};

module.exports = {
  createRequestProposal,

  getRequestProposal
};