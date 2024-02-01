const { Variables } = require('camunda-external-task-client-js');

const Service = require('./service');

const { to, TE, getToken, getProcessIdentifiers } = require('@src/helper');

const createDebtAtThirdParty = async ({ task, taskService }) => {

  const variables = new Variables();

  const { debtAtThirdParty } = task.variables.getAll();

  const proIdentifiers = getProcessIdentifiers(task);

  try {

    proIdentifiers.partyName = debtAtThirdParty.partyName;

    const [err, debtAtThirdPartyObj] = await to(Service.createDebtAtThirdParty(debtAtThirdParty, getToken(task)));

    if (err) TE(err);

    proIdentifiers.debtAtThirdPartyId = debtAtThirdPartyObj.id;

    variables.set('processIdentifiers', proIdentifiers);

    variables.set('result', debtAtThirdPartyObj);

    variables.set('success', true);

    await taskService.complete(task, variables);

  } catch (error) {

    variables.set('error', error);

    variables.set('success', false);

    await taskService.handleBpmnError(
      task,
      'ERROR_CREATE_DEBT_AT_THIRD_PARTY',
      'Unexpected Error Occurred while creating debt at third party',
      variables
    );
  }
};

const updateDebtAtThirdParty = async ({ task, taskService }) => {

  const variables = new Variables();

  const { debtAtThirdParty } = task.variables.getAll();

  const proIdentifiers = getProcessIdentifiers(task);

  try {

    proIdentifiers.partyName = debtAtThirdParty.partyName;

    const [err, debtAtThirdPartyObj] = await to(Service.updateDebtAtThirdParty(debtAtThirdParty, getToken(task)));

    if (err) TE(err);

    proIdentifiers.debtAtThirdPartyId = debtAtThirdPartyObj.id;

    variables.set('processIdentifiers', proIdentifiers);

    variables.set('result', debtAtThirdPartyObj);

    variables.set('success', true);

    await taskService.complete(task, variables);

  } catch (error) {

    variables.set('error', error);

    variables.set('success', false);

    await taskService.handleBpmnError(
      task,
      'ERROR_UPDATE_DEBT_AT_THIRD_PARTY',
      'Unexpected Error Occurred while updating debt at third party',
      variables
    );
  }
};

const deleteDebtAtThirdParty = async ({ task, taskService }) => {

  const variables = new Variables();

  const { debtAtThirdParty } = task.variables.getAll();

  try {

    const [err, debtAtThirdPartyObj] = await to(Service.deleteDebtAtThirdParty(debtAtThirdParty, getToken(task)));

    if (err) TE(err);

    variables.set('result', debtAtThirdPartyObj);

    variables.set('success', true);

    await taskService.complete(task, variables);

  } catch (error) {

    variables.set('error', error);

    variables.set('success', false);

    await taskService.handleBpmnError(
      task,
      'ERROR_DELETE_DEBT_AT_THIRD_PARTY',
      'Unexpected Error Occurred while deleting debt at third party',
      variables
    );
  }
};

module.exports = {
  createDebtAtThirdParty,

  updateDebtAtThirdParty,

  deleteDebtAtThirdParty
};