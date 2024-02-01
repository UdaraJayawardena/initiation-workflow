const axios = require('@src/axios');

const { Config } = require('@config');

const LoanManagementBaseUrl = Config.LOAN_MANAGEMENT.baseUrl;

const { to, TE } = require('@src/helper');


const selectFlexTypeSmeLoans = async (params, config) => {

  const [ err, result] = await to(axios.get(`${LoanManagementBaseUrl}/sme-loans`, {
    ...config,
    params: params
  }));

  if (err) {
    const error = { error: err };
    Error.captureStackTrace(error);
    TE(error);
  }

  return result.data;
};


module.exports = {

  selectFlexTypeSmeLoans
};