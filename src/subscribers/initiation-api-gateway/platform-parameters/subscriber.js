const { Variables } = require('camunda-external-task-client-js');

const Service = require('./service');

const { to, TE, getToken  } = require('@src/helper');

const { handleError } = require('../../subscribers-helper');

const subscriberGetPlatformParameters = async ({ task, taskService }) => {

  let variables = new Variables();


  const ERROR = 'Unexpected Error Occurred while getting platform parameters.';

  // const { platformName } = task.variables.getAll();

  try {
    // if (!platformName) TE({ code: 404, errmsg: 'platformName not found!', isBPMN: true });

    const [err, result] = await to(Service.getPlatformParameters({}, getToken(task)));

    if (err)  {
      const error = { error: err };
      Error.captureStackTrace(error);     
      TE(error);
    }

    variables.set('success', true);

    variables.set('result', result);

    variables.set('platformParameters', result);

    variables.set(task.executionId, {
      success: true
    });

    await taskService.complete(task, variables);

  } catch (error) {

    // variables.set('error', error);

    // variables.set('success', false);

    variables = handleError(task, variables, 'INITIATION_GATEWAY', error, { bpmnErrorMessage: ERROR }, { isLogger: false });

    await taskService.handleBpmnError(task,
      'ERROR_GET_PlATFORM_PARAMETERS',
      ERROR,
      variables);
  }
};

module.exports = {

  subscriberGetPlatformParameters,
};
