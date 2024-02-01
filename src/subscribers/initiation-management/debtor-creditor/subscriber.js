const { Variables } = require('camunda-external-task-client-js');

const Service = require('./service');

const { to, TE, getToken, getProcessIdentifiers } = require('@src/helper');

const createDebtorCreditor = async ({ task, taskService }) => {

  const variables = new Variables();

  const { debtorCreditor } = task.variables.getAll();

  const proIdentifiers = getProcessIdentifiers(task);

  try {

    proIdentifiers.partyName = debtorCreditor.partyName;

    const [err, debtorCreditorObj] = await to(Service.createDebtorCreditor(debtorCreditor, getToken(task)));

    if (err) TE(err);

    proIdentifiers.debtorCreditorId = debtorCreditorObj.id;

    variables.set('processIdentifiers', proIdentifiers);

    variables.set('result', debtorCreditorObj);

    variables.set('success', true);

    await taskService.complete(task, variables);

  } catch (error) {

    variables.set('error', error);

    variables.set('success', false);

    await taskService.handleBpmnError(
      task,
      'ERROR_CREATE_DEBTOR_CREDITOR',
      'Unexpected Error Occurred while creating debtor creditor',
      variables
    );
  }
};

const updateDebtorCreditor = async ({ task, taskService }) => {

  const variables = new Variables();

  const { debtorCreditor } = task.variables.getAll();

  const proIdentifiers = getProcessIdentifiers(task);

  try {

    proIdentifiers.partyName = debtorCreditor.partyName;

    const [err, debtorCreditorObj] = await to(Service.updateDebtorCreditor(debtorCreditor, getToken(task)));

    if (err) TE(err);

    proIdentifiers.debtorCreditorId = debtorCreditorObj.id;

    variables.set('processIdentifiers', proIdentifiers);

    variables.set('result', debtorCreditorObj);

    variables.set('success', true);

    await taskService.complete(task, variables);

  } catch (error) {

    variables.set('error', error);

    variables.set('success', false);

    await taskService.handleBpmnError(
      task,
      'ERROR_UPDATE_DEBTOR_CREDITOR',
      'Unexpected Error Occurred while updating debtor creditor',
      variables
    );
  }
};

const deleteDebtorCreditor = async ({ task, taskService }) => {

  const variables = new Variables();

  const { debtorCreditor } = task.variables.getAll();

  try {

    const [err, debtorCreditorObj] = await to(Service.deleteDebtorCreditor(debtorCreditor, getToken(task)));

    if (err) TE(err);

    variables.set('result', debtorCreditorObj);

    variables.set('success', true);

    await taskService.complete(task, variables);

  } catch (error) {

    variables.set('error', error);

    variables.set('success', false);

    await taskService.handleBpmnError(
      task,
      'ERROR_DELETE_DEBTOR_CREDITOR',
      'Unexpected Error Occurred while deleting debtor creditor',
      variables
    );
  }
};

module.exports = {
  createDebtorCreditor,

  updateDebtorCreditor,

  deleteDebtorCreditor
};