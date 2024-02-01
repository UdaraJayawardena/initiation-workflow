const { Variables } = require('camunda-external-task-client-js');

const Service = require('./service');

// const { to, TE, getErrorLog, mapTask, mapError, getToken } = require('@src/helper');

const { to, TE, getToken, mapTask } = require('@src/helper');

const { handleError } = require('../../subscribers-helper');

const updateBankTransaction = async ({ task, taskService }) => {

  const variables = new Variables();

  const { bankTransaction } = task.variables.getAll();

  try {

    const [err, bankTransactionObj] = await to(Service.updateBankTransaction(bankTransaction, getToken(task)));

    if (err) TE(err);
    variables.set('result', bankTransactionObj);

    variables.set('success', true);

    await taskService.complete(task, variables);

  } catch (error) {

    variables.set('error', error);

    variables.set('success', false);

    await taskService.handleBpmnError(
      task,
      'ERROR_UPDATE_BANK_TRANSACTION',
      'Unexpected Error Occurred while updating BAI bank transactions ',
      variables
    );
  }
};

const categorizeBankTransaction = async ({ task, taskService }) => {

  await taskService.extendLock(task, 9999999);

  let variables = new Variables();

  const { smeLoanRequestId, riskAnalysisSequenceNumber, runForPSD2DailyUpdate, ibanNumber, dateFrom } = task.variables.getAll();
  const ERROR = 'Categories bank transactions failed; please check yourself';
  try {
    // if (!smeLoanRequestId) TE({ httpCode:404, code: 404, message: 'Sme loan request Id not given', isBPMN: true });

    const data = {
      smeLoanRequestId: smeLoanRequestId,
      riskAnalysisSequenceNumber: (riskAnalysisSequenceNumber) ? riskAnalysisSequenceNumber : 0,
      runForPSD2DailyUpdate: (runForPSD2DailyUpdate) ? runForPSD2DailyUpdate : false,
      ibanNumber: ibanNumber,
      dateFrom: dateFrom
    };
    const [err, messageData] = await to(Service.publishMessageToCategorizeBankTransaction(data, getToken(task)));

    if (err) TE(err);

    variables.set('success', true);

    console.info({
      module: 'SEND_CATEGORIES_BANK_TRANSACTION',
      logData: {
        infoStack: {
          ...mapTask(task),
          messageId: messageData.MessageId
        }
      }
    });

    await taskService.complete(task, variables);

  } catch (error) {

    variables = handleError(task, variables, 'SEND_CATEGORIES_BANK_TRANSACTION', error, { bpmnErrorMessage: ERROR }, { isLogger: false });

    variables.set('error', error);

    await taskService.handleBpmnError(
      task,
      'ERROR_CATEGORIES_BANK_TRANSACTIONS',
      'unexpected Error Occurred while categorizing bank transactions',
      variables
    );
  }
};

const verifyCategorization = async ({ task, taskService }) => {

  await taskService.extendLock(task, 9999999);

  let variables = new Variables();

  const { error, success } = task.variables.getAll();
  const ERROR = 'Categories bank transactions failed; please check yourself';
  try {

    if (!success) {
      throw error;
    }
    variables.set('success', true);

    await taskService.complete(task, variables);

  } catch (err) {

    variables = handleError(task, variables, 'VERIFY_CATEGORIES_BANK_TRANSACTION', err, { bpmnErrorMessage: ERROR }, { isLogger: false });

    variables.set('error', err);

    await taskService.handleBpmnError(
      task,
      'ERROR_CATEGORIES_BANK_TRANSACTIONS',
      'unexpected Error Occurred while categorizing bank transactions',
      variables
    );
  }
};


const getBankTransactionByBankId = async ({ task, taskService }) => {

  const variables = new Variables();

  const { bankTransactionTypes } = task.variables.getAll();

  try {    
    
    const [err, bankTransactions] = await to(Service.bankTransactionByBankId(bankTransactionTypes.bank_id, getToken(task)));

    if (err) TE(err);

    variables.set('bankTransactionByBankId', bankTransactions);

    variables.set('result', bankTransactions);

    variables.set('success', true);

    await taskService.complete(task, variables);

  } catch (error) {
  
    variables.set('error', error);

    variables.set('success', false);

    await taskService.handleBpmnError(
      task,
      'ERROR_CATEGORIES_BANK_TRANSACTIONS',
      'unexpected Error Occured while categorizing bank transactions',
      variables
    );
  }
};

module.exports = {
  updateBankTransaction,
  categorizeBankTransaction,
  getBankTransactionByBankId,
  verifyCategorization
};