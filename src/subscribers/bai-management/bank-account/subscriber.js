const { Variables } = require('camunda-external-task-client-js');

const Service = require('./service');

// const { to, TE, getErrorLog, mapTask, mapError, getToken } = require('@src/helper');

//const { Logger } = require('@src/modules/log');

const { to, TE, getToken, } = require('@src/helper');

const createBankAccount = async ({ task, taskService }) => {
  
  const variables = new Variables();

  const { bankAccountObj } = task.variables.getAll();
  
  try {

    const [err, bankAccount] = await to(Service.createBankAccount(bankAccountObj, getToken(task)));

    if (err) TE(err);

    variables.set('result', bankAccount);

    variables.set('success', true);

    await taskService.complete(task, variables);

  } catch (error) {

    variables.set('error', error);

    variables.set('success', false);

    await taskService.handleBpmnError(
      task,
      'ERROR_CREATE_BANK_ACCOUNT',
      'Unexpected Error Occurred while creating bank account',
      variables
    );
  }
};

const updateBankAccount = async ({ task, taskService }) => {

  const variables = new Variables();

  const { bankAccountObj } = task.variables.getAll();

  const updateBankAccount = {
    id: bankAccountObj.id,
    currrency: bankAccountObj.currrency ,
    type : bankAccountObj.type 
  };

  try {

    const [err, bankAccountObj] = await to(Service.updateBankAccount(updateBankAccount, getToken(task)));

    if (err) TE(err);

    variables.set('result', bankAccountObj);

    variables.set('success', true);

    await taskService.complete(task, variables);

  } catch (error) {
    variables.set('error', error);

    variables.set('success', false);

    await taskService.handleBpmnError(
      task,
      'ERROR_UPDATE_BANK_ACCOUNT',
      'Unexpected Error Occurred while updating bank account',
      variables
    );
  }
};

const deleteBankAccount = async ({ task, taskService }) => {

  const variables = new Variables();

  const { bankAccountObj } = task.variables.getAll();

  const updateBankAccount = {
    id: bankAccountObj.id,
    status: 'closed'
  };

  try {

    const [err, bankAccountObj] = await to(Service.deleteBankAccount(updateBankAccount, getToken(task)));

    if (err) TE(err);

    variables.set('result', bankAccountObj);

    variables.set('success', true);

    await taskService.complete(task, variables);

  } catch (error) {
    variables.set('error', error);

    variables.set('success', false);

    await taskService.handleBpmnError(
      task,
      'ERROR_UPDATE_BANK_ACCOUNT',
      'Unexpected Error Occurred while updating bank account',
      variables
    );
  }
};
module.exports = {
  createBankAccount,
  updateBankAccount,
  deleteBankAccount
};