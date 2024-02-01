const { Variables } = require('camunda-external-task-client-js');

const Service = require('./service');

const { selectQuery } = require('./query');

const { to, TE, mapTask, mapError, getProcessIdentifiers } = require('@src/helper');

const { Logger } = require('@src/modules/log');

const VTigerService = require('../../../services/v-tiger');

const { handleError } = require('../../subscribers-helper');

const LoanManagement = require('../../../services/loan-management');

const { REVISION_V_TIGER_CALL } = require('@config').Config;

const _getOpportunity = async (contractId) => {

  const query = selectQuery('Potentials', {
    potential_no: { value: contractId, nextOperator: '' }
  });

  const [err, response] = await to(Service.query(query));

  if(err && err.stack) TE(err);

  if(err) {
    const error = { error: err };
    Error.captureStackTrace(error);
    TE(error);
  }

  if(!response){
    const error = { error: 'Contract-Id doesn\'t exist in v-tiger' };
    Error.captureStackTrace(error);
    TE(error);
  }

  const { result } = response;

  if(!result 
    || result.length <= 0) {
    const error = { error: 'Contract-Id doesn\'t exist in v-tiger' };
    Error.captureStackTrace(error);
    TE(error);
  }

  return result[0];
};

const _getOrganization = async (accountNo) => {

  const query = selectQuery('Accounts', {
    id: { value: accountNo, nextOperator: '' }
  });

  const [err, response] = await to(Service.query(query));

  if(err) {
    const error = { error: err };
    Error.captureStackTrace(error);
    TE(error);
  }

  if(!response) return {};

  const { result } = response;

  if(!result 
    || result.length <= 0) return {};

  return result[0];
};

const _getContact = async (contactNo) => {

  const query = selectQuery('Contacts', {
    id: { value: contactNo, nextOperator: '' }
  });

  const [err, response] = await to(Service.query(query));

  if(err) {
    const error = { error: err };
    Error.captureStackTrace(error);
    TE(error);
  }

  if(!response) return {};

  const { result } = response;

  if(!result 
    || result.length <= 0) return {};

  return result[0];
};

const getAllInfoOutOfVTiger = async ({ task, taskService }) => {

  const variables = new Variables();

  let { contractId } = task.variables.getAll();
  const { smeLoanRequest } = task.variables.getAll();

  const proIdentifiers = getProcessIdentifiers(task);

  const ERROR = 'Unexpected Error Occurred while getting v-tiger data';

  try {

    contractId = contractId || smeLoanRequest.contractId;
    const opportunity = await _getOpportunity(contractId);

    const [organization, contact] = await Promise.all([
      _getOrganization(opportunity.related_to),
      _getContact(opportunity.contact_id)
    ]);

    proIdentifiers.customerLegalName = organization.accountname;

    variables.set('processIdentifiers', proIdentifiers);

    variables.set('opportunity', opportunity);

    variables.set('organization', organization);

    variables.set('contact', contact);

    variables.set(task.executionId, {
      success: true
    });

    await taskService.complete(task, variables);

  } catch (error) {

    const errorStack = mapError(error, ERROR);

    Logger.error({
      module: 'V_TIGER',
      logData: {
        errorStack: errorStack,
        infoStack: mapTask(task)
      }
    });

    variables.set(task.executionId, {
      success: false,
      errorStack: errorStack
    });

    await taskService.handleBpmnError(
      task,
      'ERROR_IMPORT_V_TIGER',
      ERROR,
      variables
    );
  }
};


const revisionCallToVtiger = async ({ task, taskService }) => {

  let variables = new Variables();

  const { contractId, customerId, revisionDate, isVtigerCallSent, riskAnalysisSequenceNumber, PSD2Status, creditLimitAmount   } = task.variables.getAll();

  const ERROR = 'Unexpected Error Occurred while creating v-tiger data';

  try {
    if(!isVtigerCallSent){
      // this mean, need to create vTiger potential for revision
      // 1st step need to get account Id (3x<1234>)
      let accountId = null;
      const Accounts = await VTigerService.getAccounts( { account_no: { value: customerId } },['id']);
      if(Accounts.length > 0){
        accountId = Accounts[0].id;
      }
      const consentAvalilable = (PSD2Status == 'in-request' || PSD2Status == 'active')? '1':'0';
      // 2nd step need create required inputs and call to create vTiger potential
      if(accountId){
        
        const desiredloanamount = creditLimitAmount;

        const riskAnalysisUrl = `${REVISION_V_TIGER_CALL.risk_analysis_base_url}?contractId=${contractId}&&riskAnalysisSequenceNumber=${riskAnalysisSequenceNumber}`;
        // account available so now we can call to vtiger
        const element = {
          pipeline : REVISION_V_TIGER_CALL.pipeline,
          sales_stage : REVISION_V_TIGER_CALL.sales_stage,
          cf_potentials_desiredloanamount :  desiredloanamount,
          related_to : accountId, //`Accounts:${accountId}`
          cf_potentials_riskanalysisurl : riskAnalysisUrl,
          cf_potentials_psd2oropenbankingconsent : consentAvalilable,
          cf_potentials_loanrequestid : contractId,
          closingdate : revisionDate,
          amount : desiredloanamount,
          potentialname : contractId, // required field
          assigned_user_id : REVISION_V_TIGER_CALL.assigned_user_id // required field
        };
        // calling to create potential
        await VTigerService.createPotential(element);
        // updating isVtigerCallSent since create potential went success and no need to create it again
        variables.set('isVtigerCallSent', true);

      }else {
        // account details cannot found.
        const error = { error: `account details does not exist for ${customerId} in v-tiger` };
        Error.captureStackTrace(error);
        TE(error);
      }
    }
 
    variables.set(task.executionId, {
      success: true
    });

    await taskService.complete(task, variables);

  } catch (error) {

    variables = handleError(task, variables, 'V_TIGER', error, { bpmnErrorMessage: ERROR }, { isLogger: false });

    await taskService.handleBpmnError(
      task,
      'ERROR_CREATE_V_TIGER_POTENTIAL',
      ERROR,
      variables
    );
  }
};

module.exports = {

  getAllInfoOutOfVTiger,
  revisionCallToVtiger,
};