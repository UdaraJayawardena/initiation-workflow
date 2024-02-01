const { Variables } = require('camunda-external-task-client-js');

const Service = require('./service');

const { to, TE, getToken } = require('@src/helper');

const { handleError } = require('../../../subscribers-helper');

const bindLoanPurposeRPByParams = async ({ task, taskService }) => {

  let variables = new Variables();

  let { params } = task.variables.getAll();

  const ERROR = 'Unexpected Error Occurred while binding loan-purpose-risk-parameters;';

  try {

    params = JSON.parse(params);

    const [err, result] = await to(Service.getLoanPurposeRPList(params, getToken(task)));

    if (err) {
      const error = { error: err };
      Error.captureStackTrace(error);     
      TE(error);
    }

    variables.set('loanPurposeRiskParameters', result);

    variables.set(task.executionId, {
      success: true
    });

    await taskService.complete(task, variables);

  } catch (error) {

    variables = handleError(task, variables, 'CONFIG', error, { bpmnErrorMessage: ERROR }, { isLogger: false });

    await taskService.handleBpmnError(
      task,
      'ERROR_BIND_PURPOSE_RISK_PARAMETER',
      ERROR,
      variables
    );
  }
};

module.exports = {
  
  bindLoanPurposeRPByParams,
};