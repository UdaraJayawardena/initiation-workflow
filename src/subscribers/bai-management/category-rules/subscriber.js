const { Variables } = require('camunda-external-task-client-js');

const Service = require('./service');

const { to, TE, mapTask, getErrorLog, getStringError, mapError, getToken } = require('@src/helper');

const { Logger } = require('@src/modules/log');

const ACTION_TYPES = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
};

const processCategoryRuleSubscriber= async ({ task, taskService }) => {

  const variables = new Variables();

  const { action } = task.variables.getAll();
  const { categoryDataForUpdate, categoryDataForCreate } = task.variables.getAll();

  const errorLog = getErrorLog(task);

  const headerToken = getToken(task);

  const ERROR = 'Process Category Rule failed';

  try {

    if(!action) {
      const error = { error: 'Can\'t find action parameter.' };
      Error.captureStackTrace(error);
      TE(error);
    }

    if( !Object.values(ACTION_TYPES).includes(action) ) {
      const error = { error: 'Action parameter is not valide.' };
      Error.captureStackTrace(error);
      TE(error);
    }

    let responseData = null;


    if( action === ACTION_TYPES.CREATE ) {

      const [err, insertedCategory] = await to(createNewCategoryRule(categoryDataForCreate, headerToken));

      if (err) {
        const error = { error: err };
        Error.captureStackTrace(error);
        TE(error);
      }

      responseData = insertedCategory;

    }

    if( action === ACTION_TYPES.UPDATE ) {

      const [err, updatedCategory] = await to(updateExistingCategoryRule(categoryDataForUpdate.categoryId, categoryDataForUpdate.data, headerToken));

      if (err) {
        const error = { error: err };
        Error.captureStackTrace(error);
        TE(error);
      }

      responseData = updatedCategory;

    }

    if( action === ACTION_TYPES.DELETE ) {

      const [err, deletedRecord] = await to(deleteExistingCategoryRule(categoryDataForUpdate.categoryId, headerToken));

      if (err) {
        const error = { error: err };
        Error.captureStackTrace(error);
        TE(error);
      }

      responseData = deletedRecord;

    }

    variables.set('processedCategoryRule', responseData);

    variables.set('result', responseData);

    variables.set('success', true);

    variables.set(task.executionId, {
      success: true
    });

    await taskService.complete(task, variables);

  } catch (error) {

    const errorStack = mapError(error, ERROR);

    Logger.error({
      module: 'CATEGORY_RULE',
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

    variables.set('errorLog', errorLog);
  
    variables.set('error', error);

    await taskService.handleBpmnError(
      task,
      'ERROR_PROCESS_CATEGORY_RULE',
      ERROR,
      variables
    );
  }
};

const createNewCategoryRule = async (categoryData, requestToken) => {

  try {
    
    if( !categoryData ) TE('Can\'t find data for category update process');

    const requestData = { categoryRule: categoryData };

    const [err, insertedCategory] = await to(Service.createCategoryRule(requestData, requestToken));

    if( err ) TE(err);

    return insertedCategory;

  } catch (error) {
    TE(error);
  }

};

const updateExistingCategoryRule = async (categoryRuleId, categoryData, requestToken) => {

  try {
    
    if( !categoryRuleId ) TE('Can\'t find id for category update process');

    if( !categoryData ) TE('Can\'t find data for category update process');

    const requestData = { categoryRuleId, ...categoryData };

    const [err, updatedCategory] = await to(Service.updateCategoryRule(requestData, requestToken));

    if( err ) TE(err);

    return updatedCategory;

  } catch (error) {
    TE(error);
  }

};

const deleteExistingCategoryRule = async (ruleId, requestToken) => {

  try {
    
    if( !ruleId || ruleId === '' ) TE('Can\'t find ruleId for category delete process');

    const [err, updatedCategory] = await to(Service.deleteCategoryRule(ruleId, requestToken));

    if( err ) TE(err);

    return updatedCategory;

  } catch (error) {
    TE(error);
  }

};


module.exports = {
  processCategoryRuleSubscriber
};