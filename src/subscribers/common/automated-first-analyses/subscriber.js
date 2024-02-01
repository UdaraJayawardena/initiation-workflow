// Import third party module
const { Variables } = require('camunda-external-task-client-js');

// Import outer module
const { InitiationManagementService } = require('@src/services');
const { 
  TE, 
  mapTask, 
  getStringError, 
  mapError, 
  getToken, 
  getErrorLog } = require('@src/helper');
const { Logger } = require('@src/modules/log');

// Import inner module
const Indicators = require('./indicators');

const { SmeLoanRequestService, PlatformParameterService,  } = InitiationManagementService;

const MODULE = 'AUTOMATED_FIRST_ANALYSES';

const _handleError = (task, variables, errorLog, error, ERROR) => {

  const errorStack = mapError(error, ERROR);

  Logger.error({
    module: MODULE,
    logData: {
      errorStack: errorStack,
      infoStack: mapTask(task)
    }
  });

  variables.set(task.executionId, { success: false, errorStack: errorStack });

  const strError = getStringError(errorStack.error);

  errorLog.push(strError);
 
  variables.set('errorLog', errorLog);

  variables.set('error', error);

  return variables;
};

/**
 * STEP 01: Get details about the loan-request, loan-initiation-platform-parameters
 * 
 * @param {string} contractId smeLoanRequest contract-id
 * @param {object} token token config object { reqId, authToken }
 * @returns {object} { smeLoanRequest, platformParameter }
 */
const _getCoreDetails = async (contractId, token) => {

  const smeLoanRequest = await SmeLoanRequestService
    .getSmeLoanRequest({ contractId }, token);

  const platformParameters = await PlatformParameterService
    .getPlatformParameterList({ platformName: 'BridgeFund BV' }, token);

  if(platformParameters.length <= 0) {
    const error = { error: 'Platform not found' };
    Error.captureStackTrace(error);
    TE(error);
  }

  const platformParameter = platformParameters[0];

  return { smeLoanRequest, platformParameter };
};

const makeFirstAnalysesIndicators = async ({ task, taskService }) => {

  let variables = new Variables();

  const errorLog = getErrorLog(task);

  const { smeLoanRequestContractId } = task.variables.getAll();

  const ERROR = 'Unexpected error occurred while making first analyses indicators';

  try {

    const token = getToken(task);

    // STEP 1: Get details about Loan-Request
    const { smeLoanRequest, platformParameter } = await _getCoreDetails(smeLoanRequestContractId, token);

    const { customerId } = smeLoanRequest;
    
    variables.set('contractId', smeLoanRequestContractId);

    // STEP 2: Check legal-form
    const legalFormResult = await Indicators.checkLegalForm(customerId, token);
    const { legalFormIndicator } = legalFormResult;
    variables.set('legalFormIndicator', legalFormIndicator);

    // STEP 3: Check High-Risk-Register
    const  { isSkipStep03, customer } = legalFormResult;
    const highRiskRegister = await Indicators.checkHighRiskRegister(customer, isSkipStep03, token);
    const { customerHighRiskIndicator, personHighRiskIndicator } = highRiskRegister;
    variables.set('customerHighRiskIndicator', customerHighRiskIndicator);
    variables.set('personHighRiskIndicator', personHighRiskIndicator);

    // STEP 4: check bank-transaction file(s)
    const bankTransactionFileResult = await Indicators.checkBankTransactionFiles(
      smeLoanRequestContractId, 
      platformParameter, 
      token);

    variables.set('bankFileIndicator1', bankTransactionFileResult.bankFileIndicator1);
    variables.set('bankFileIndicator2', bankTransactionFileResult.bankFileIndicator2);
    variables.set('bankFileIndicator3', bankTransactionFileResult.bankFileIndicator3);
    variables.set('numberOfBankAccounts', bankTransactionFileResult.numberOfBankAccounts);
    variables.set('numberOfDaysInBankFile', bankTransactionFileResult.numberOfDays);

    // STEP 5: check turn-over of bank-account with highest turn-over
    const turnOverIndicatorResult = await Indicators.checkHighestTurnOver(
      bankTransactionFileResult, 
      platformParameter, 
      token);
    variables.set('turnOverIndicator', turnOverIndicatorResult.turnOverIndicator);
    variables.set('turnOverOnYearlyBase', turnOverIndicatorResult.turnOverOnYearlyBase);
    variables.set('turnOver', turnOverIndicatorResult.turnOver);

    // STEP 6: check expected-dd-amount against end-of-day balance
    const { highestSmeLoanRequestBlocks } = turnOverIndicatorResult;
    const expectedDDAmountResult = await Indicators.checkExpectedDDAmount(
      smeLoanRequest, 
      highestSmeLoanRequestBlocks, 
      platformParameter, 
      token);

    variables.set('expectedSuccessDDIndicator', expectedDDAmountResult.expectedSuccessDDIndicator);
    variables.set('expectedSuccessDDPercentage', expectedDDAmountResult.aboveBalance);
    variables.set('calculatedExpectedLoanAmount', expectedDDAmountResult.calculatedExpectedLoanAmount);

    variables.set(task.executionId, {
      success: true
    });

    await taskService.complete(task, variables);

  } catch (error) {

    variables = _handleError(task, variables, errorLog, error, ERROR);

    const errorCode = 'ERROR_DETERMINE_HIGHEST_BANK_ACCOUNT';

    await taskService.handleBpmnError(task, errorCode, ERROR, variables);
  }
};

module.exports = {
  makeFirstAnalysesIndicators
};