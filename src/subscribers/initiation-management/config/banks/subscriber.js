const { Variables } = require('camunda-external-task-client-js');

const Service = require('./service');

const { to, TE, getErrorLog, mapTask, mapError, getToken, getProcessIdentifiers } = require('@src/helper');

const { Logger } = require('@src/modules/log');

const getBank = async ({ task, taskService }) => {

  const variables = new Variables();

  const errorLog = getErrorLog(task);

  const { smeLoanRequest } = task.variables.getAll();

  const ERROR = 'Get bank failed; please check yourself';

  try {

    const bicCode = smeLoanRequest.bicCode;

    const [err, bank] = await to(Service.getBank(bicCode, getToken(task)));

    if (err) {
      const error = { error: err };
      Error.captureStackTrace(error);     
      TE(error);
    }

    const bankDetails = bank.length > 0 ? bank[0] : {};

    variables.set('bank', bankDetails);

    variables.set(task.executionId, {
      success: true
    });

    await taskService.complete(task, variables);

  } catch (error) {

    const errorStack = mapError(error, ERROR);

    Logger.error({
      module: 'CRM',
      logData: {
        errorStack: errorStack,
        infoStack: mapTask(task)
      }
    });

    variables.set(task.executionId, {
      success: false,
      errorStack: errorStack
    });

    errorLog.push(ERROR);

    variables.set('errorLog', errorLog);

    await taskService.handleBpmnError(
      task,
      'ERROR_GET_BANK',
      ERROR,
      variables
    );
  }
};

const updateBank = async ({ task, taskService }) => {

  const variables = new Variables();

  const { bank } = task.variables.getAll();

  const proIdentifiers = getProcessIdentifiers(task);

  try {
    let bankObj, err;

    const action = bank.action;

    proIdentifiers.bankFullName = bank.bankFullName;

    switch (action) {

      case 'create': {

        [err, bankObj] = await to(Service.createBank(bank, getToken(task)));

        if (err) TE(err);

        break;
      }
      case 'update': {
        [err, bankObj] = await to(Service.updateBank(bank, getToken(task)));

        if (err) TE(err);

        break;
      }
      default: TE('Invalid action');
    }

    proIdentifiers.bankId = bankObj.id;

    variables.set('processIdentifiers', proIdentifiers);

    variables.set('result', bankObj);

    variables.set('success', true);

    await taskService.complete(task, variables);

  } catch (error) {

    variables.set('error', error);

    variables.set('success', false);

    await taskService.handleBpmnError(
      task,
      'ERROR_UPDATE_BANK',
      'Unexpected Error Occurred while updating bank',
      variables
    );
  }
};

const bindBankBicCodes = async ({ task, taskService }) => {

  const variables = new Variables();

  const errorLog = [];

  const { targetObject, fieldNameBicCode, fieldNameIban } = task.variables.getAll();

  const ERROR = 'Unexpected Error Occurred while binding bank bic;';

  try {

    const inputObj = task.variables.get(targetObject);

    const inputList = Array.isArray(inputObj) ? inputObj : [inputObj];

    for (let i = 0; i < inputList.length; i++) {
      
      const input = inputList[i];
      
      const [err, bank] = await to(Service.getBankByIban(input[fieldNameIban]));

      if (err) {
        const error = { error: err, errorInfo: {
          iban: input[fieldNameIban],
        } };
        Error.captureStackTrace(error);     
        TE(error);
      }

      input[fieldNameBicCode] = bank.bicCode;

      inputList[i] = input;
    }

    const outputList = Array.isArray(inputObj) ? inputList : inputList[0];

    variables.set(targetObject, outputList);

    variables.set(task.executionId, {
      success: true
    });

    await taskService.complete(task, variables);

  } catch (error) {

    const errorStack = mapError(error, ERROR);

    Logger.error({
      module: 'LI_CONFIG',
      logData: {
        errorStack: errorStack,
        infoStack: mapTask(task)
      }
    });

    variables.set(task.executionId, {
      success: false,
      errorStack: errorStack
    });

    errorLog.push(ERROR);

    variables.set('errorLog', errorLog);

    await taskService.handleBpmnError(
      task,
      'ERROR_BIND_BANK_BIC_CODES',
      ERROR,
      variables
    );
  }
};

module.exports = {
  
  getBank,
  
  updateBank,

  bindBankBicCodes
};