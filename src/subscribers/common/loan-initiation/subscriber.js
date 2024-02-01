const { Variables } = require('camunda-external-task-client-js');

const { 
  VTigerService, 
  CamundaClientService,
  AutomatedAnalysis } = require('@src/services');

const { getToken, mapTask, getStringError, getErrorLog, mapError, TE } = require('@src/helper');

const { handleError } = require('../../subscribers-helper');

const { APPLICATION, V_TIGER } = require('@config').Config;

const MODULE = 'LOAN_INITIATION';

const { Logger } = require('@src/modules/log');

const { FirstAnalysisIndicators } = AutomatedAnalysis;

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

const checkAlreadyActiveRevision = async ({ task, taskService }) => {

  let variables = new Variables();

  const errorLog = getErrorLog(task);

  const { historyProcessInstance } = CamundaClientService;

  const ERROR = 'Unexpected error occurred while checking active revision';

  try {

    const processInstanceResult = await historyProcessInstance.getHistoryProcessInstances({
      processInstanceBusinessKey: task.businessKey,
      processDefinitionKey: 'revision-flex-loan',
      active: true
    }, getToken(task));

    if (processInstanceResult && processInstanceResult.length > 0) {
      const processInstance = processInstanceResult[0];

      variables.set('result', {
        id: processInstance.id,
        businessKey: processInstance.businessKey,
        definitionId: processInstance.processDefinitionId
      });

      variables.set('isAlreadyStartedRevision', true);

    } else {

      variables.set('isAlreadyStartedRevision', false);
    }

    await taskService.complete(task, variables);

  } catch (error) {

    variables = _handleError(task, variables, errorLog, error, ERROR);

    const errorCode = 'ERROR_CHECK_ALREADY_ACTIVE_REVISION';

    await taskService.handleBpmnError(task, errorCode, ERROR, variables);
  }
};

const automatedFirstAnalysis = async ({ task, taskService }) => {

  let variables = new Variables();

  const ERROR = 'Unexpected error occurred while processed automated first analysis';

  try {

    const token = getToken(task);

    const { smeLoanRequestContractId } = task.variables.getAll();

    const firstAnalysisIndicator = await FirstAnalysisIndicators
      .create({ contractId: smeLoanRequestContractId }, token);

    const getIndicatorValue = (indicator) =>  indicator ? indicator.value : '';

    variables.set('legalEntityIndicator', getIndicatorValue(firstAnalysisIndicator.legalEntityIndicator));
    variables.set('riskProfileOrganizationIndicator', getIndicatorValue(firstAnalysisIndicator.riskProfileOrganizationIndicator));
    variables.set('riskProfilePersonIndicator', getIndicatorValue(firstAnalysisIndicator.riskProfilePersonIndicator));
    variables.set('revenueAmountIndicator', getIndicatorValue(firstAnalysisIndicator.revenueAmountIndicator));
    // variables.set('calculatedExpectedLoanAmount', 0);
    // variables.set('bankFileIndicator1', firstAnalysisIndicator);
    variables.set('lastBankFileDateIndicator', getIndicatorValue(firstAnalysisIndicator.lastBankFileDateIndicator)); //bankFileIndicator2
    variables.set('numberOfDaysInMainBankFileIndicator', getIndicatorValue(firstAnalysisIndicator.numberOfDaysInMainBankFileIndicator)); //bankFileIndicator3
    variables.set('expectedSuccessDDIndicator', getIndicatorValue(firstAnalysisIndicator.expectedSuccessDDIndicator));
    variables.set('firstAnalysisOutcomeIndicator', getIndicatorValue(firstAnalysisIndicator.firstAnalysisOutcomeIndicator));

    await taskService.complete(task, variables);

  } catch (error) {

    variables = handleError(task, variables, MODULE, error, { bpmnErrorMessage: ERROR }, { isLogger: false });

    const errorCode = 'ERROR_AUTOMATED_FIRST_ANALYSIS';

    await taskService.handleBpmnError(task, errorCode, ERROR, variables);
  }
};

const updateVTigerAfterFirstAnalyses = async ({ task, taskService }) => {

  let variables = new Variables();

  const ERROR = 'Unexpected error occurred while updating v-tiger after first analyses';

  try {

    const { 
      smeLoanRequestContractId,
      legalEntityIndicator,
      riskProfileOrganizationIndicator,
      riskProfilePersonIndicator,
      revenueAmountIndicator,
      // calculatedExpectedLoanAmount,
      lastBankFileDateIndicator,
      numberOfDaysInMainBankFileIndicator,
      expectedSuccessDDIndicator,
      firstAnalysisOutcomeIndicator
    } = task.variables.getAll();

    let potentialNo = smeLoanRequestContractId;

    if (APPLICATION.IS_NOT_PROD && !APPLICATION.IS_STAGE) {
      const samplePotentials = V_TIGER.samplePotentials ? V_TIGER.samplePotentials : [];

      if (samplePotentials.length <= 0) TE('Sample potential_no not found');

      const samplePotential = samplePotentials[0];

      potentialNo = samplePotential.potential_no;
    }

    const potentialConditions = { potential_no: { value: potentialNo } };

    const potentials = await VTigerService.getPotentials(potentialConditions, ['id']);

    if(potentials.length > 0){

      const potential = potentials[0];

      variables.set('potentialId', potential.id);

      const reviseElement = {
        id: potential.id,
        cf_potentials_legalformindicator: legalEntityIndicator,
        cf_potentials_customerhighriskindicator: riskProfileOrganizationIndicator,
        cf_potentials_personhighriskindicator: riskProfilePersonIndicator,
        cf_potentials_turnoverindicator: revenueAmountIndicator,
        // cf_potentials_calculatedexpectedloanamount: 0,
        // cf_potentials_bankfileindicator1: '',
        cf_potentials_bankfileindicator2: lastBankFileDateIndicator,
        cf_potentials_bankfileindicator3: numberOfDaysInMainBankFileIndicator,
        cf_potentials_expectedddindicator: expectedSuccessDDIndicator,
        cf_potentials_firstanalysesindicator: firstAnalysisOutcomeIndicator,
      };

      variables.set('updatePotential', reviseElement);

      await VTigerService.revisePotential(reviseElement);
    }

    await taskService.complete(task, variables);

  } catch (error) {

    variables = handleError(task, variables, MODULE, error, { bpmnErrorMessage: ERROR }, { isLogger: false });

    const errorCode = 'ERROR_UPDATE_V_TIGER_AFTER_FIRST_ANALYSES';

    await taskService.handleBpmnError(task, errorCode, ERROR, variables);
  }
};

module.exports = {

  checkAlreadyActiveRevision,

  automatedFirstAnalysis,

  updateVTigerAfterFirstAnalyses
};

