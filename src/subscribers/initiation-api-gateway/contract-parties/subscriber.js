const { Variables } = require('camunda-external-task-client-js');

const Service = require('./service');

const { to, TE, getToken  } = require('@src/helper');

const { handleError } = require('../../subscribers-helper');

const subscriberGetContractPartiesAccordingToContractId = async ({ task, taskService }) => {

  let variables = new Variables();

  const ERROR = 'Unexpected Error Occurred while getting contract parties according to contractId';

  const { contractId } = task.variables.getAll();

  try {
    if (!contractId) {
      const error = { error: 'ContractId not found!' };
      Error.captureStackTrace(error);     
      TE(error);
    }

    const [err, result] = await to(Service.getContractPartiesAccordingToContractId({contractId:contractId}, getToken(task)));

    if (err)  {
      const error = { error: err };
      Error.captureStackTrace(error);     
      TE(error);
    }

    // set customerLegalName
    let customerLegalName = '';
    if(result && result.contractParties.length > 0) {
      const firstPerson  = result.contractParties.find(scp => scp.signContractIndicator  == 'signature-required');
      customerLegalName = (firstPerson.customerLegalName)?firstPerson.customerLegalName : '';
    }

    variables.set('customerLegalName', customerLegalName);

    variables.set('success', true);

    variables.set('result', result);

    variables.set('contractParties', result);

    variables.set(task.executionId, {
      success: true
    });

    await taskService.complete(task, variables);

  } catch (error) {

    variables = handleError(task, variables, 'INITIATION_GATEWAY', error, { bpmnErrorMessage: ERROR }, { isLogger: false });

    // variables.set('error', error);

    // variables.set('success', false);



    await taskService.handleBpmnError(task,
      'ERROR_GET_CONTRACT_PARTIES',
      ERROR,
      variables);
  }
};

module.exports = {

  subscriberGetContractPartiesAccordingToContractId,
};
