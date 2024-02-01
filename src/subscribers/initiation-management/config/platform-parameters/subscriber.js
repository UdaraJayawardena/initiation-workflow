const { Variables } = require('camunda-external-task-client-js');

const Service = require('./service');
const { to, TE, getToken, getProcessIdentifiers } = require('@src/helper');

const updatePlatformParameter = async ({ task, taskService }) => {

  const variables = new Variables();

  const { platformParameter } = task.variables.getAll();

  const proIdentifiers = getProcessIdentifiers(task);

  try {
    let platformParameterObj, err;

    const action = platformParameter.action;

    proIdentifiers.platformName = platformParameter.platformName;

    switch (action) {

      case 'create': {

        [err, platformParameterObj] = await to(Service.createPlatformParameter(platformParameter, getToken(task)));

        if (err) TE(err);

        break;
      }
      case 'update': {
        [err, platformParameterObj] = await to(Service.updatePlatformParameter(platformParameter, getToken(task)));

        if (err) TE(err);

        break;
      }
      default: TE('Invalid action');
    }

    proIdentifiers.bankId = platformParameterObj.id;

    variables.set('processIdentifiers', proIdentifiers);

    variables.set('result', platformParameterObj);

    variables.set('success', true);

    await taskService.complete(task, variables);

  } catch (error) {

    variables.set('error', error);

    variables.set('success', false);

    await taskService.handleBpmnError(
      task,
      'ERROR_UPDATE_PLATFORM_PARAMETER',
      'Unexpected Error Occured while updating platform parameter',
      variables
    );
  }
};

module.exports = {
  updatePlatformParameter
};