const Mapper = require('./mapper');

const { to } = require('@src/helper');

const { getCustomerDetails } = require('../../../crm-gateway/service');

const VTigerService = require('../../v-tiger/service');
const { selectQuery } = require('../../v-tiger/query');

const _getNoOfRejections = async (accountId) => {

  const query = selectQuery('Potentials', {
    related_to: { value: accountId, nextOperator: 'AND' },
    lost_reason: { value: 'Rejected by credit committee', nextOperator: '' }
  }, ['count(*)']);

  const [err, response] = await to(VTigerService.query(query));

  if(err) {
    console.error('Determine credit-risk-parameter','loan-request-rejection','_getNoOfRejections ', ':', err);
    return 0;
  }

  const { result } = response;

  if(!result 
    || result.length <= 0) return 0;

  return result[0].count;
};

const _getAccountsId = async (cocNumber) => {

  const query = selectQuery('Accounts', {
    cf_accounts_chamberofcommercenumber: { value: cocNumber, nextOperator: '' }
  }, ['id']);

  const [err, response] = await to(VTigerService.query(query));

  if(err) {
    console.error('Determine credit-risk-parameter','loan-request-rejection','_getAccountsId ', ':', err);
    return null;
  }

  if(!response) return null;

  const { result } = response;

  if(!result 
    || result.length <= 0) return null;

  return result[0].id;
};

const generate = async (
  task,
  smeLoanRequest,
  creditRiskParameterType,
) => {

  const customerId = smeLoanRequest.customerId;

  const [err, customerDetails] = await to(getCustomerDetails({ customerId: customerId }));

  let noOfRejections  = 0;

  if(err) {
    console.error('Determine credit-risk-parameter','loan-request-rejection','generate ', ':', err);
    noOfRejections = 0;
  }

  const cocNumber = customerDetails.customer.cocId;

  const accountId = await _getAccountsId(cocNumber);

  if(accountId){
    noOfRejections = await _getNoOfRejections(accountId);
  }

  return Mapper(
    smeLoanRequest,
    creditRiskParameterType,
    noOfRejections,
    'vTiger');
};

module.exports = { generate };