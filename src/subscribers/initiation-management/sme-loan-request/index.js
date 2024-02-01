const {
  updateSmeLoanRequest,

  updateSmeLoanRequestTemp,

  mappingSmeLoanRequest,

  updateSmeLoanRequestBankruptInfo,

  getSmeLoanRequest,

  updateSmeLoanRequestStatus,
} = require('./subscriber');

module.exports = {

  subscribe: async (client) => {

    await client.subscribe('update-sme-loan-request', updateSmeLoanRequest);

    // This is a temporary functions, we should change above update-sme-loan-request to create-sme-loan-request
    await client.subscribe('update-sme-loan-request-temp', updateSmeLoanRequestTemp);

    await client.subscribe('mapping-sme-loan-request', mappingSmeLoanRequest);

    await client.subscribe('update-sme-loan-request-bankrupt-info', updateSmeLoanRequestBankruptInfo);

    await client.subscribe('get-sme-loan-request', getSmeLoanRequest);

    await client.subscribe('update-sme-loan-request-status', updateSmeLoanRequestStatus);
  }
};