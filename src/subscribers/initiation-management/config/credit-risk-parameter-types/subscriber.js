const { Variables } = require('camunda-external-task-client-js');

const Service = require('./service');

// const { to, TE, getErrorLog, mapTask, mapError, getToken } = require('@src/helper');

//const { Logger } = require('@src/modules/log');

const { to, TE, getToken, } = require('@src/helper');

const createCreditRiskParameterTypes = async ({ task, taskService }) => {

  const variables = new Variables();

  const CRPTypesObj = task.variables.getAll();

  try {

    const [err, CRPTypes] = await to(Service.createCreditRiskParameterTypes(CRPTypesObj.creditRiskParameterTypesObj, getToken(task)));

    if (err) TE(err);

    variables.set('result', CRPTypes);

    variables.set('success', true);

    await taskService.complete(task, variables);

  } catch (error) {

    variables.set('error', error);

    variables.set('success', false);

    await taskService.handleBpmnError(
      task,
      'ERROR_CREATE_CREDIT_RISK_PARAMETERS',
      'Unexpected Error Occurred while creating credit risk parameter types',
      variables
    );
  }
};

const updateCreditRiskParameterTypes = async ({ task, taskService }) => {

  const variables = new Variables();

  const CRPTypesObj = task.variables.getAll();

  const updateCRPTypes = {
    id: CRPTypesObj.creditRiskParameterTypesObj.id,
    description: CRPTypesObj.creditRiskParameterTypesObj.description,
    format: CRPTypesObj.creditRiskParameterTypesObj.format
  };

  try {

    const [err, CRPTypes] = await to(Service.updateCreditRiskParameterTypes(updateCRPTypes, getToken(task)));

    if (err) TE(err);

    variables.set('result', CRPTypes);

    variables.set('success', true);

    await taskService.complete(task, variables);

  } catch (error) {
    variables.set('error', error);

    variables.set('success', false);

    await taskService.handleBpmnError(
      task,
      'ERROR_UPDATE_CREDIT_RISK_PARAMETERS',
      'Unexpected Error Occurred while updating credit risk parameter types',
      variables
    );
  }
};

const deleteCreditRiskParameterTypes = async ({ task, taskService }) => {

  const variables = new Variables();

  const CRPTypesObj = task.variables.getAll();

  try {

    const query = `?type=${CRPTypesObj.creditRiskParameterTypesObj.type}`;
    const [error, CreditRiskParameters] = await to(Service.getCreditRiskParameterList(query));
    let hasResponse = {};

    if (error) TE(error);

    if (CreditRiskParameters && CreditRiskParameters.length == 0) {

      const [err, CRPTypes] = await to(Service.deleteCreditRiskParameterTypes(CRPTypesObj.creditRiskParameterTypesObj._id, getToken(task)));
      if (err) TE(err);
      hasResponse = CRPTypes;
    }
    else {
      hasResponse = {
        'description': 'Type is in use'
      };

    }
    variables.set('result', hasResponse);
    variables.set('success', true);
    await taskService.complete(task, variables);

  } catch (error) {
    variables.set('error', error);

    variables.set('success', false);

    await taskService.handleBpmnError(
      task,
      'ERROR_DELETE_CREDIT_RISK_PARAMETERS',
      'Unexpected Error Occurred while deleting credit risk parameter types',
      variables
    );
  }
};

const getCreditRiskParameter = async () => {

  try {

    const [err, creditRiskParameters] = await to(Service.getCreditRiskParameters());

    if (err) TE(err);

    return creditRiskParameters;

  } catch (error) {
    TE(error);
  }

};
module.exports = {
  createCreditRiskParameterTypes,
  updateCreditRiskParameterTypes,
  deleteCreditRiskParameterTypes,
  getCreditRiskParameter
};