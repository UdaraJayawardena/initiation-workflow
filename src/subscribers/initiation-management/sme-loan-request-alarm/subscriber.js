/* eslint-disable no-unused-vars */
const { Variables } = require('camunda-external-task-client-js');

const Service = require('./service');

const { to, TE, getToken } = require('@src/helper');

const { handleError } = require('../../subscribers-helper');

const addSmeLoanRequestAlarm = async ({ task, taskService }) => {

  let variables = new Variables();

  const { smeLoanRequestAlarm } = task.variables.getAll();

  const ERROR = 'SME-LOAN-REQUEST-ALARM add failed:';

  try {

    if(smeLoanRequestAlarm.length > 0){
      const [err, result] = await to(Service.addSmeLoanRequestAlarm({smeLoanRequestsAlarms:smeLoanRequestAlarm}, getToken(task)));

      if(err) {
        const error = { error: err };
        Error.captureStackTrace(error);
        TE(err);
      }
  
      variables.set('smeLoanRequestAlramResult', result.data);
      // const { success, message, data } = result;
    }


    
    variables.set(task.executionId, {
      success: true
    });

    await taskService.complete(task, variables);

  } catch (error) {

    variables = handleError(task, variables, 'CATEGORIES_BANK_TRANSACTION', error, { bpmnErrorMessage: ERROR }, { isLogger: false });
  
    variables.set('error', error);

    await taskService.handleBpmnError(
      task,
      'ERROR_ADD_SME_LOAN_REQUEST_ALARMS',
      'unexpected Error Occured while adding sme loan request alarms',
      variables
    );
  }
};

module.exports = {
  addSmeLoanRequestAlarm
};