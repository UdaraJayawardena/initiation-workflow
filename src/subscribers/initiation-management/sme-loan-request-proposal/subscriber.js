const { Variables } = require('camunda-external-task-client-js');

const Service = require('./service');

const { to, TE, getErrorLog, mapTask, getStringError, mapError, getToken } = require('@src/helper');

const { Logger } = require('@src/modules/log');

const updateRequestProposal = async ({ task, taskService }) => {

  const variables = new Variables();

  const { smeLoanRequest, 
    smeLoanRequestProposal, 
    lastWorkingDay } = task.variables.getAll();

  const errorLog = getErrorLog(task);

  const ERROR = 'SME-LOAN-REQUEST-PROPOSAL update failed:';

  try {

    smeLoanRequestProposal.smeLoanRequestId = smeLoanRequest.sysId;
    
    // smeLoanRequestProposal.maturityDate = lastWorkingDay;
    if(smeLoanRequest.loanType == 'fixed-loan') {      
      smeLoanRequestProposal.maturityDate = lastWorkingDay;              
    } 
    
    const [err, result] = await to(Service.createRequestProposal(smeLoanRequestProposal, getToken(task)));

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

    variables.set('smeLoanRequestProposal', {
      sysId: data._id,
      ...data
    });
    
    variables.set(task.executionId, {
      success: true
    });

    await taskService.complete(task, variables);

  } catch (error) {

    const errorStack = mapError(error, ERROR);

    Logger.error({
      module: 'SME_LOAN_REQUEST_PROPOSAL',
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
      'ERROR_UPDATE_SME_LOAN_REQUEST_PROPOSAL',
      ERROR,
      variables
    );
  }
};

const getRequestProposal = async ({ task, taskService }) => {

  const variables = new Variables();

  const errorLog = getErrorLog(task);

  const { smeLoanRequestProposal } = task.variables.getAll();

  const ERROR = 'Unexpected Error Occurred while getting sme loan request proposal';

  try {
    
    const [err, result] = await to(Service.getRequestProposal(smeLoanRequestProposal.id, getToken(task)));

    if(err) {
      const error = { error: err };
      Error.captureStackTrace(error);
      TE(error);
    }

    variables.set('smeLoanRequestProposal', result);

    variables.set('smeLoanRequest', result.smeLoanRequestId);

    variables.set(task.executionId, {
      success: true
    });

    await taskService.complete(task, variables);

  } catch (error) {

    const errorStack = mapError(error, ERROR);

    Logger.error({
      module: 'SME_LOAN_REQUEST_PROPOSAL',
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
      'ERROR_GET_SME_LOAN_REQUEST_PROPOSAL',
      ERROR,
      variables
    );
  }
};

module.exports = {
  updateRequestProposal,

  getRequestProposal
};