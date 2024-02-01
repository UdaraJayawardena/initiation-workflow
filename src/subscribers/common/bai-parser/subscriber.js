const { Variables } = require('camunda-external-task-client-js');

const Service = require('./service');

const { 
  // to, TE, 
  mapTask, mapError, getErrorLog, getStringError  } = require('@src/helper');

const { Logger } = require('@src/modules/log');
const { handleError } = require('@src/subscribers/subscribers-helper');

const MODULE = 'BAI_PARSER';

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

const _mapRequest = (urlsObj, task) => {

  const { 
    smeLoanRequestContractId, 
    bankTransactionFormat,
    customerId,
    riskAnalysisSequenceNumber  } = task.variables.getAll();

  const sequenceNumber = riskAnalysisSequenceNumber ? 
    riskAnalysisSequenceNumber : 0;

  return {
    sme_loan_request_id: smeLoanRequestContractId,
    sme_loan_request_type: bankTransactionFormat,
    ...urlsObj,
    customer_id: customerId,
    process_definition_key: task.processDefinitionKey,
    risk_analysis_sequence_number: sequenceNumber
  };
};

const _informToBAIParser = (requestData, task, ERROR) => {
  
  Service.addSmeLoanRequest(requestData).catch( error => {

    console.error('BAI-PARSER ERROR ', error);

    const errorStack = mapError(error, ERROR);

    Logger.error({
      module: MODULE,
      logData: {
        errorStack: errorStack,
        infoStack: mapTask(task)
      }
    });
  });
};

const processMT940 = async ({ task, taskService }) => {

  let variables = new Variables();

  const { mt940Urls } = task.variables.getAll();

  const ERROR = 'Unexpected Error Occurred while processing mt940';

  try {

    const urls = mt940Urls.split(',');

    const mt940UrlsObj = { urls: {} };

    urls.forEach((url, index) => mt940UrlsObj.urls[index] = url);

    const mapMt940Request = _mapRequest(mt940UrlsObj, task);

    _informToBAIParser(mapMt940Request, task, ERROR);

    variables.set('mapMt940Request', mapMt940Request);

    variables.set(task.executionId, {
      success: true
    });

    await taskService.complete(task, variables);

  } catch (error) {

    variables = handleError(task, variables, 'BAI_PARSER', error, { bpmnErrorMessage: ERROR }, { isLogger: false });

    const errorCode = 'ERROR_PROCESS_MT940';

    await taskService.handleBpmnError(task, errorCode, ERROR, variables);
  }
};

const processPSD2 = async ({ task, taskService }) => {

  let variables = new Variables();

  const { psd2Urls } = task.variables.getAll();

  const ERROR = 'Unexpected Error Occurred while processing PSD2';

  try {

    const urls = psd2Urls.split(',');

    const psd2UrlsObj = { urls: {} };

    urls.forEach((url, index) => psd2UrlsObj.urls[index] = url);

    const mapPSD2Request = _mapRequest(psd2UrlsObj, task);

    _informToBAIParser(mapPSD2Request, task, ERROR);

    variables.set('mapPSD2Request', mapPSD2Request);

    variables.set(task.executionId, {
      success: true
    });

    await taskService.complete(task, variables);

  } catch (error) {

    variables = handleError(task, variables, 'BAI_PARSER', error, { bpmnErrorMessage: ERROR }, { isLogger: false });

    const errorCode = 'ERROR_PROCESS_PSD2';

    await taskService.handleBpmnError(task, errorCode, ERROR, variables);
  }
};


const parsDailyPSD2Transactions = async ({ task, taskService }) => {

  let variables = new Variables();

  const errorLog = getErrorLog(task);

  const ERROR = 'Unexpected Error Occurred while pars Daily PSD2 Bank Transactions';

  // eslint-disable-next-line no-unused-vars
  const { psd2DataUrl, ibanNumber, dateFrom, customerId } = task.variables.getAll();

  try {
    // const urls = [];
    // urls.push(psd2DataUrl);

    const transactionData = {
      customer_id: customerId,
      sme_loan_request_type : 'PSD2',
      process_definition_key : 'daily-psd2-update',
      'urls[0]': psd2DataUrl
    };

    // const transactionData = {
    //   fileUrl : psd2DataUrl, 
    //   ibanNumber : ibanNumber, 
    //   datefrom : dateFrom
    // }

    const parserResults = await Service.addSmeLoanRequest( transactionData );

    if( parserResults ) {
      variables.set( 'parserResults', parserResults );
    }

    await taskService.complete( task, variables );

  } catch ( error ) {

    variables = _handleError( task, variables, errorLog, error, ERROR );

    const errorCode = 'ERROR_PARS_DAILY_PSD2';

    await taskService.handleBpmnError( task, errorCode, ERROR, variables );
  }
};

module.exports = {

  processMT940,

  processPSD2,

  parsDailyPSD2Transactions
};