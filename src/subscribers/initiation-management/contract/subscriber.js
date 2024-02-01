const { Variables } = require('camunda-external-task-client-js');

const Service = require('./service');

const { to, TE, mapTask, getErrorLog, getStringError, mapError, getToken } = require('@src/helper');

const { Logger } = require('@src/modules/log');

const { CAMUNDA } = require('@config').Config;

// const { VariableInstanceService } = require('@src/modules/camunda-engine/variable-instance/index');

const { VariableInstance } = require('../../../bpmn').EngineRest;

const createContract = async ({ task, taskService }) => {

  const variables = new Variables();

  const errorLog = getErrorLog(task);

  const { smeLoanRequest, smeLoanRequestProposal, crmData, bank } = task.variables.getAll();

  const customer = crmData.customer.customer;

  const ERROR = 'CONTRACT create failed';

  try {

    const contract = {
      contractId: smeLoanRequest.contractId,
      customerId: customer.id,
      contractIdExtention: smeLoanRequest.contractIdExtension,
      legalForm: customer.legalForm,
      loanType: smeLoanRequest.loanType,
      language: customer.language,
      smeLoanRequestId: smeLoanRequest.id,
      platform: smeLoanRequest.platform,
      smeLoanRequestProposalId: smeLoanRequestProposal.id,
      principleAmount: smeLoanRequestProposal.principleAmount,
      initialFeeAmount: smeLoanRequestProposal.initialFeeAmount,
      interestAmount: smeLoanRequestProposal.interestAmount,
      recurringCostAmountPerMonth: smeLoanRequestProposal.recurringCostAmountPerMonth,
      totalLoanAmount: smeLoanRequestProposal.totalLoanAmount,
      numberOfDirectDebitsFirstPeriod: smeLoanRequestProposal.numberOfDirectDebitsFirstPeriod,
      directDebitAmountForFirstPeriod: smeLoanRequestProposal.directDebitAmountForFirstPeriod,
      numberOfDirectDebitsSecondPeriod: smeLoanRequestProposal.numberOfDirectDebitsSecondPeriod,
      directDebitAmountForSecondPeriod: smeLoanRequestProposal.directDebitAmountForSecondPeriod,
      numberOfDirectDebitsThirdPeriod: smeLoanRequestProposal.numberOfDirectDebitsThirdPeriod,
      directDebitAmountForThirdPeriod: smeLoanRequestProposal.directDebitAmountForThirdPeriod,
      iban: smeLoanRequest.iban,
      bicCode: bank.bicCode ? bank.bicCode : '',
      bankName: bank.bankFullName ? bank.bankFullName : '',
      creditLimitAmount: smeLoanRequestProposal.creditLimitAmount ? smeLoanRequestProposal.creditLimitAmount: '',
      plannedNumberOfMonths: smeLoanRequestProposal.plannedNumberOfDirectDebitMonth ? smeLoanRequestProposal.plannedNumberOfDirectDebitMonth: '',
      directDebitFrequency: smeLoanRequestProposal.directDebitFrequency ? smeLoanRequestProposal.directDebitFrequency: '',
      plannedNumberOfDirectDebits: smeLoanRequestProposal.plannedNumberOfDirectDebits ? smeLoanRequestProposal.plannedNumberOfDirectDebits: '',
      withdrawalCostPercentage: smeLoanRequestProposal.withdrawalCostPercentage ? smeLoanRequestProposal.withdrawalCostPercentage: '',
      recurringInterestPercentage: smeLoanRequestProposal.recurringInterestPercentage ? smeLoanRequestProposal.recurringInterestPercentage: '',
      recurringCostCollectionDay: smeLoanRequestProposal.recurringCostCollectionDay ? smeLoanRequestProposal.recurringCostCollectionDay: ''
    };

    const [err, newContract] = await to(Service.createContract(contract, getToken(task)));

    if (err) {
      const error = { error: err };
      Error.captureStackTrace(error);
      TE(error);
    }

    variables.set('contract', newContract);

    variables.set(task.executionId, {
      success: true
    });

    await taskService.complete(task, variables);

  } catch (error) {

    const errorStack = mapError(error, ERROR);

    Logger.error({
      module: 'CONTRACT',
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

    await taskService.handleBpmnError(
      task,
      'ERROR_CREATE_CONTRACT',
      ERROR,
      variables
    );
  }
};

const generateContractHtml = async ({ task, taskService }) => {

  const variables = new Variables();

  const errorLog = [];

  const ERROR = 'CONTRACT-HTML generate failed';

  const { contract, updateCustomer } = task.variables.getAll();

  try {

    const [err, htmlDoc] = await to(Service.generateContract(contract.contractId, updateCustomer, getToken(task)));

    if (err) {
      const error = { error: err };
      Error.captureStackTrace(error);
      TE(error);
    }

    contract.html = htmlDoc;

    variables.set('contract', contract);

    variables.set('result', contract);

    variables.set('success', true);

    variables.set(task.executionId, {
      success: true
    });

    variables.set('errorLog', errorLog);

    await taskService.complete(task, variables);

  } catch (error) {

    const errorStack = mapError(error, ERROR);

    Logger.error({
      module: 'CONTRACT',
      logData: {
        errorStack: errorStack,
        infoStack: mapTask(task)
      }
    });

    variables.set('success', false);

    variables.set(task.executionId, {
      success: false,
      errorStack: errorStack
    });

    const strError = getStringError(errorStack.error);

    errorLog.push(strError);

    variables.set('errorLog', errorLog);

    await taskService.handleBpmnError(
      task,
      'ERROR_GENERATE_CONTRACT',
      ERROR,
      variables
    );
  }

};

const updateContract = async ({ task, taskService }) => {

  const variables = new Variables();

  const errorLog = [];

  const ERROR = 'CONTRACT update failed';

  const { contract, systemDate, document, parentProcessInstanceId, contractPdfDocumentProperties } = task.variables.getAll();

  try {

    if (document) {

      const [err, base64Url] = await to(VariableInstance
        .getAttachmentFrom('contractPdfDocument', parentProcessInstanceId, CAMUNDA.auth));

      if (err) {
        const error = { error: err };
        Error.captureStackTrace(error);
        TE(error);
      }

      contract['pdfDocument'] = contractPdfDocumentProperties;
      contract.pdfDocument.dataUrl = `data:${contractPdfDocumentProperties.type};base64,${base64Url}`;
    }

    const [err, newContract] = await to(Service.updateContract({ contract, systemDate }, getToken(task)));

    if (err) {
      const error = { error: err };
      Error.captureStackTrace(error);
      TE(error);
    }

    contract.contractId = newContract.contractId;

    variables.set('contract', contract);

    variables.set('result', contract);

    variables.set('success', true);

    variables.set(task.executionId, {
      success: true
    });

    variables.set('errorLog', errorLog);

    await taskService.complete(task, variables);

  } catch (error) {

    const errorStack = mapError(error, ERROR);

    Logger.error({
      module: 'CONTRACT',
      logData: {
        errorStack: errorStack,
        infoStack: mapTask(task)
      }
    });

    variables.set('success', false);

    variables.set(task.executionId, {
      success: false,
      errorStack: errorStack
    });

    const strError = getStringError(errorStack.error);

    errorLog.push(strError);

    variables.set('errorLog', errorLog);

    await taskService.handleBpmnError(
      task,
      'ERROR_UPDATE_CONTRACT',
      ERROR,
      variables
    );
  }
};

const deleteExistContractsAndContractparties = async ({ task, taskService }) => {

  const variables = new Variables();

  const errorLog = getErrorLog(task);

  const ERROR = 'CONTRACT delete failed';

  const { smeLoanRequest } = task.variables.getAll();

  try {

    const contractId = smeLoanRequest.contractId;

    const [err] = await to(Service
      .deleteExistContractsAndContractparties(contractId, getToken(task)));

    if (err) {
      const error = { error: err };
      Error.captureStackTrace(error);
      TE(error);
    }

    variables.set(task.executionId, {
      success: true
    });

    await taskService.complete(task, variables);

  } catch (error) {

    const errorStack = mapError(error, ERROR);

    Logger.error({
      module: 'CONTRACT',
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

    await taskService.handleBpmnError(
      task,
      'ERROR_DELETE_EXIST_CONTRACTS_AND_CONTRACTPARTIES',
      ERROR,
      variables
    );
  }
};

module.exports = {
  createContract,
  updateContract,
  generateContractHtml,
  deleteExistContractsAndContractparties,
};