// Import third party module
const { Variables } = require('camunda-external-task-client-js');

// Import outer module
const { InitiationManagementService, BaiManagementService } = require('@src/services');
const { Logger } = require('@src/modules/log');
const { to, TE, mapTask, getStringError, mapError, getToken, getErrorLog } = require('@src/helper');
const { Validators } = require('@src/utilities');

// Import inner module
const CRPGenerators = require('./parameter-types');
const { 
  getDebtsAndDebtorsCreditors,
  createCreditRiskParameterList,
} = require('./service');
const { handleError } = require('@src/subscribers/subscribers-helper');

const { SmeLoanRequestService, 
  CreditRiskParameterTypeService } = InitiationManagementService;

const { BankTransactionService,
  SmeLoanRequestTransactionBlockService } = BaiManagementService;

const MODULE = 'DETERMINE_CRP';

const _handleError = (task, variables, errorLog, error, ERROR) => {

  const errorStack = mapError(error, ERROR);

  Logger.error({
    module: MODULE,
    logData: {
      errorStack: errorStack,
      infoStack: mapTask(task)
    }
  });

  variables.set(task.executionId, { success: false, errorStack: errorStack });

  const strError = getStringError(errorStack.error);

  errorLog.push(strError);

  variables.set('errorLog', errorLog);

  variables.set('error', error);

  return variables;
};

const determineHighestTurnoverBankAccount = async ({ task, taskService }) => {

  let variables = new Variables();

  const { smeLoanRequestId, smeLoanRequestContractId } = task.variables.getAll();

  const ERROR = 'Unexpected error occurred while determine highest turnover update failed';

  try {

    const token = getToken(task);

    const smeLoanRequest = await SmeLoanRequestService.getSmeLoanRequest({
      id: smeLoanRequestId,
      contractId: smeLoanRequestContractId
    }, token);

    const smeLoanRequestBlocks = await SmeLoanRequestTransactionBlockService
      .getSmeLoanRequestBlocks({ 
        action: 'get',
        sme_loan_request_id: smeLoanRequest.contractId 
      }, token);

    const highestSmeLoanRequestBlocks = await Validators
      .validateHighestTurnoverIndicator(smeLoanRequestBlocks, token);

    variables.set('smeLoanRequest', smeLoanRequest);

    variables.set('smeLoanRequestBlocks', smeLoanRequestBlocks);

    variables.set('highestSmeLoanRequestBlocks', highestSmeLoanRequestBlocks);

    variables.set(task.executionId, {
      success: true
    });

    await taskService.complete(task, variables);

  } catch (error) {

    variables = handleError(task, variables, MODULE, error, { bpmnErrorMessage: ERROR }, { isLogger: false });

    const errorCode = 'ERROR_DETERMINE_HIGHEST_BANK_ACCOUNT';

    await taskService.handleBpmnError(task, errorCode, ERROR, variables);
  }
};

const createCreditRiskParameters = async ({ task, taskService }) => {

  let variables = new Variables();

  const errorLog = [];

  const { smeLoanRequest, highestSmeLoanRequestBlocks } = task.variables.getAll();

  const ERROR = 'Unexpected error occurred while creating credit-risk-parameters';

  try {

    const [err, creditRiskParameterTypes] = await to(CreditRiskParameterTypeService
      .getCreditRiskPTList({}, getToken(task)));

    if (err) {
      const error = { error: err };
      Error.captureStackTrace(error);
      TE(error);
    }

    for (let i = 0; i < highestSmeLoanRequestBlocks.length; i++) {
      
      const smeLoanRequestBlock = highestSmeLoanRequestBlocks[i];

      const bankTransactions = await BankTransactionService.getBankTransactions({
        action: 'GET',
        iban_number: smeLoanRequestBlock.iban_number,
        start_date: smeLoanRequestBlock.start_date,
        end_date: smeLoanRequestBlock.end_date
      }, getToken(task));

      const debtorsCreditors = await getDebtsAndDebtorsCreditors(smeLoanRequest, task);

      const generateList = creditRiskParameterTypes.map( (crpType, index) => {
        const { type } = crpType;
        const crGenerators = CRPGenerators(index+1, type);
        if(!crGenerators){
          errorLog.push(`parameter-type '${type}' must be added to credit-risks-parameter-type table or process`);
          return undefined;
        }
        return crGenerators.generate(
          task,
          smeLoanRequest,
          crpType,
          smeLoanRequestBlock,
          bankTransactions,
          debtorsCreditors
        );
      }).filter((crpType) => crpType);
      
      const [err, creditRiskParameters] = await to(Promise.all(generateList));

      if(err) {
        const error = { error: err };
        Error.captureStackTrace(error);
        TE(error);
      }

      await createCreditRiskParameterList(creditRiskParameters, task);
    }

    variables.set('errorLog', errorLog);

    variables.set(task.executionId, { success: true });

    await taskService.complete(task, variables);

  } catch (error) {

    variables = handleError(task, variables, MODULE, error, { bpmnErrorMessage: ERROR }, { isLogger: false });

    const errorCode = 'ERROR_CREATE_CRP';

    await taskService.handleBpmnError(task, errorCode, ERROR, variables);
  }
};

module.exports = {
  determineHighestTurnoverBankAccount,
  createCreditRiskParameters
};