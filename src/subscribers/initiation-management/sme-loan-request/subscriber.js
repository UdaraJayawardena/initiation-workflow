const { Variables } = require('camunda-external-task-client-js');

const Service = require('./service');

const { TERMS_MAPPING } = require('./constants');

const { handleError } = require('../../subscribers-helper');

const { to, TE, mapTask, getStringError, mapError, getToken } = require('@src/helper');

const { Logger } = require('@src/modules/log');

const _getDesiredDurationInMonths = (loanPurposeRiskParameters) => {
  if(!loanPurposeRiskParameters) return 0;

  if(loanPurposeRiskParameters.length < 1){
    return 0;
  }

  return loanPurposeRiskParameters[0].standardDuration;
};

const _getLoanPurposeRisk = (loanPurposeRiskParameters, primarySbiCode) => {

  if(!loanPurposeRiskParameters || loanPurposeRiskParameters.length === 0) {
    return 'high';
  }

  if(loanPurposeRiskParameters.length > 1){
    const subPrimarySbiCode = primarySbiCode.substring(0, 2);
    const loanPurposeRiskParameter = loanPurposeRiskParameters.find( loanPurposeRiskParameter => {
      const sbiCode = loanPurposeRiskParameter.sbiCode;
      const subSbiCode = sbiCode.substring(0, 2);
      return subSbiCode === subPrimarySbiCode;
    });

    if(loanPurposeRiskParameter) {
      return loanPurposeRiskParameter.standardRiskCategory;
    }

    const othersParameter = loanPurposeRiskParameters.find( loanPurposeRiskParameter => {
      const sbiCode = loanPurposeRiskParameter.sbiCode;
      return sbiCode === 'others';
    });

    if(othersParameter) return othersParameter.standardRiskCategory;

    return 'high';
  }

  return loanPurposeRiskParameters[0]
    .standardRiskCategory;
};

const _getDesiredDirectDebitFrequency = (loanType) => {
  switch (loanType) {
    case 'fixed-loan': return 'daily';
    case 'flex-loan': return 'weekly';
    default: return 'daily';
  }
};

const _getNumberOfDirectDebits = (smeLoanRequest) => {

  const { desiredDurationInMonths, desiredDirectDebitFrequency } = smeLoanRequest;

  return TERMS_MAPPING[desiredDurationInMonths][desiredDirectDebitFrequency];
};

const _calculateDesiredDirectDebitAmount = (smeLoanRequest, standardLoanPricingParameter) => {

  if(!standardLoanPricingParameter) return 0;

  const { loanPurposeRisk, desiredDurationInMonths, desiredPrincipleAmount, loanType } = smeLoanRequest;

  const initialInterestPercentage = standardLoanPricingParameter[`${loanPurposeRisk}RiskInitialFeePercentage`];
  const riskSurchargePercentage = standardLoanPricingParameter[`${loanPurposeRisk}RiskSurchargePercentage`];
  const decimalDesiredPrincipleAmount = parseFloat(desiredPrincipleAmount);

  const interestCosts = (initialInterestPercentage/100 + riskSurchargePercentage/100) * desiredDurationInMonths * decimalDesiredPrincipleAmount;

  const totalLoanAmount = decimalDesiredPrincipleAmount + interestCosts;

  if(loanType === 'fixed-loan'){
    const numberOfDirectDebit = _getNumberOfDirectDebits(smeLoanRequest);
    return totalLoanAmount/numberOfDirectDebit;
  }

  return 0;
};

const updateSmeLoanRequest = async ({ task, taskService }) => {

  let variables = new Variables();

  const errorLog = [];

  const { updateCustomer, contractId, updatePerson } = task.variables.getAll();

  let smeLoanRequest = task.variables.get('smeLoanRequest');


  // console.log(task.variables.getAll());

  const ERROR = 'SME-LOAN-REQUEST update failed:';

  try {

    smeLoanRequest = typeof smeLoanRequest === 'string' ? 
      JSON.parse(smeLoanRequest) : 
      smeLoanRequest;

    // const { primarySbiCode, id } = updateCustomer;

    smeLoanRequest.customerId = updateCustomer.id;

    smeLoanRequest.primarySbiCode = updateCustomer.primarySbiCode;

    smeLoanRequest.primaryCustomerSuccessManager = updateCustomer.primaryCustomerSuccessManager;

    smeLoanRequest.primaryStakeholderWithinSme = updatePerson.id;

    if(contractId) smeLoanRequest.contractId = contractId;

    smeLoanRequest.contractIdExtension = 0;
    
    const [err, result] = await to(Service.createSmeLoanRequest(smeLoanRequest, getToken(task)));

    if(err) {
      const error = { error: err };
      Error.captureStackTrace(error);
      TE(error);
    }

    const { success, message, data } = result;

    if(!success) {
      const error = { error: message };
      Error.captureStackTrace(error);
      TE(error);
    }

    variables.set('smeLoanRequest', {
      sysId: data._id,
      ...data
    });

    variables.set('errorLog', errorLog);

    variables.set(task.executionId, {
      success: true
    });

    await taskService.complete(task, variables);

  } catch (error) {

    variables = handleError(task, variables, 'SME_LOAN_REQUEST', error, { bpmnErrorMessage: ERROR }, { isLogger: false });

    await taskService.handleBpmnError(
      task,
      'ERROR_UPDATE_SME_LOAN_REQUEST',
      ERROR,
      variables
    );
  }
};

const updateSmeLoanRequestTemp = async ({ task, taskService }) => {

  const variables = new Variables();

  const errorLog = [];

  let smeLoanRequest = task.variables.get('smeLoanRequest');

  const ERROR = 'SME-LOAN-REQUEST update failed:';

  try {

    smeLoanRequest = typeof smeLoanRequest === 'string' ? 
      JSON.parse(smeLoanRequest) : 
      smeLoanRequest;
    
    const [err, result] = await to(Service.createSmeLoanRequest(smeLoanRequest, getToken(task)));

    if(err) {
      const error = { error: err };
      Error.captureStackTrace(error);
      TE(error);
    }

    const { success, message, data } = result;

    if(!success) {
      const error = { error: message };
      Error.captureStackTrace(error);
      TE(error);
    }

    variables.set('smeLoanRequest', {
      sysId: data._id,
      ...data
    });

    variables.set('errorLog', errorLog);

    variables.set(task.executionId, {
      success: true
    });

    await taskService.complete(task, variables);

  } catch (error) {

    const errorStack = mapError(error, ERROR);

    Logger.error({
      module: 'SME_LOAN_REQUEST',
      logData: {
        errorStack: errorStack,
        infoStack: mapTask(task)
      }
    });

    variables.set(task.executionId, {
      success: false,
      errorStack: errorStack
    });

    const strError = getStringError(errorStack.error);

    errorLog.push(strError);

    variables.set('errorLog', errorLog);

    await taskService.handleBpmnError(
      task,
      'ERROR_UPDATE_SME_LOAN_REQUEST',
      ERROR,
      variables
    );
  }
};

const mappingSmeLoanRequest = async ({ task, taskService }) => {

  let variables = new Variables();

  const { 
    updateCustomer, 
    // updatePerson,
    loanPurposeRiskParameters,
    standardLoanPricingParameter } = task.variables.getAll();

  let smeLoanRequest = task.variables.get('smeLoanRequest');

  const ERROR = 'SME-LOAN-REQUEST mapping failed:';

  try {

    smeLoanRequest = JSON.parse(smeLoanRequest);

    const loanPurposeRisk = _getLoanPurposeRisk(loanPurposeRiskParameters, updateCustomer.primarySbiCode);

    smeLoanRequest = {
      action: 'create',
      contractId: smeLoanRequest.contractId,
      // contractIdExtension: 0,
      // customerId: updateCustomer.id,
      requestType: smeLoanRequest.requestType,
      // idRefinancedLoan: empty
      loanType: smeLoanRequest.loanType,
      status: 'received-from-customer',
      purposeIndicator: smeLoanRequest.purposeIndicator,
      // smeRemarkOnPurpose = empty
      // internalRemarkOnPurpose = empty
      desiredPrincipleAmount: smeLoanRequest.desiredLoanAmount,
      desiredDurationInMonths: _getDesiredDurationInMonths(loanPurposeRiskParameters),
      // desiredStartDate: empty
      desiredDirectDebitFrequency: _getDesiredDirectDebitFrequency(smeLoanRequest.loanType),
      desiredLoanUrgencyIndicator: smeLoanRequest.desiredLoanUrgencyIndicator,
      // riskCategory: empty
      // riskCategoryIndicator: empty
      loanPurposeRisk: loanPurposeRisk,
      // primaryCustomerSuccessManager: smeLoanRequest.primaryCustomerSuccessManager,
      // primaryStakeholderWithinSme: updatePerson.id, //person-id of CRM.Stakeholder (1.4)
      //  iban: empty
      applicationId: smeLoanRequest.applicationId
    };

    const desiredDirectDebitAmount = _calculateDesiredDirectDebitAmount(smeLoanRequest, standardLoanPricingParameter);

    smeLoanRequest.desiredDirectDebitAmount = desiredDirectDebitAmount;

    variables.set('smeLoanRequest', smeLoanRequest);

    variables.set('loanAmount', desiredDirectDebitAmount);

    variables.set('loanType', smeLoanRequest.loanType);

    variables.set(task.executionId, {
      success: true
    });

    await taskService.complete(task, variables);

  } catch (error) {

    variables = handleError(task, variables, 'SME_LOAN_REQUEST', error, { bpmnErrorMessage: ERROR }, { isLogger: false });

    await taskService.handleBpmnError(
      task,
      'ERROR_MAP_SME_LOAN_REQUEST',
      ERROR,
      variables
    );
  }
};

const updateSmeLoanRequestBankruptInfo = async ({ task, taskService }) => {

  const variables = new Variables();

  const { debtAtThirdParty } = task.variables.getAll();

  try {

    const smeLoanRequestBody = {
      id: debtAtThirdParty.smeLoanRequestId,
      contractId: debtAtThirdParty.contractId,
      bankruptIndicator: debtAtThirdParty.bankruptIndicator,
      bankruptCompanyName: debtAtThirdParty.bankruptCompanyName
    };

    const [err, debtAtThirdPartyObj] = await to(Service.updateSmeLoanRequest(smeLoanRequestBody, getToken(task)));

    if (err) TE(err);

    debtAtThirdParty.smeLoanRequestId = debtAtThirdPartyObj.id;

    variables.set('debtAtThirdParty', debtAtThirdParty);

    variables.set('result', debtAtThirdPartyObj);

    variables.set('success', true);

    await taskService.complete(task, variables);

  } catch (error) {

    variables.set('error', error);

    variables.set('success', false);

    await taskService.handleBpmnError(
      task,
      'ERROR_UPDATE_SME_LOAN_REQUEST_REQUEST_BANKRUPT_INFO',
      'Unexpected Error Occurred while updating sme loan request',
      variables
    );
  }
};

const getSmeLoanRequest = async ({ task, taskService }) => {

  const variables = new Variables();

  const { debtorCreditor } = task.variables.getAll();

  try {

    const smeLoanRequestBody = {
      id: debtorCreditor.smeLoanRequestId,
      contractId: debtorCreditor.contractId
    };

    const [err, debtAtThirdPartyObj] = await to(Service.getSmeLoanRequest(smeLoanRequestBody, getToken(task)));

    if (err) TE(err);

    if (!debtAtThirdPartyObj) TE('Cannot find SME loan request');

    debtorCreditor.smeLoanRequestId = debtAtThirdPartyObj.id;

    variables.set('debtorCreditor', debtorCreditor);

    variables.set('result', debtAtThirdPartyObj);

    variables.set('success', true);

    await taskService.complete(task, variables);

  } catch (error) {

    variables.set('error', error);

    variables.set('success', false);

    await taskService.handleBpmnError(
      task,
      'ERROR_UPDATE_SME_LOAN_REQUEST_REQUEST_BANKRUPT_INFO',
      'Unexpected Error Occurred while updating sme loan request',
      variables
    );
  }
};

const updateSmeLoanRequestStatus = async ({ task, taskService }) => {

  let variables = new Variables();

  const { smeLoanRequestStatus, smeLoanRequestContractId } = task.variables.getAll();

  const ERROR = 'Unexpected Error Occurred while updating sme loan request';

  try {

    const smeLoanRequestBody = {
      contractId: smeLoanRequestContractId,
      status: smeLoanRequestStatus
    };

    const [err, smeLoanRequest] = await to(Service.updateSmeLoanRequest(smeLoanRequestBody, getToken(task)));

    if (err) TE(err);

    variables.set('smeLoanRequest', smeLoanRequest);

    variables.set('result', smeLoanRequest);

    variables.set('success', true);

    await taskService.complete(task, variables);

  } catch (error) {

    variables = handleError(task, variables, 'SME_LOAN_REQUEST', error, { bpmnErrorMessage: ERROR }, { isLogger: false });

    await taskService.handleBpmnError(
      task,
      'ERROR_UPDATE_SME_LOAN_REQUEST_REQUEST_STATUS',
      ERROR,
      variables
    );
  }
};

module.exports = {

  updateSmeLoanRequest,

  updateSmeLoanRequestTemp,

  mappingSmeLoanRequest,

  updateSmeLoanRequestBankruptInfo,

  getSmeLoanRequest,

  updateSmeLoanRequestStatus
};