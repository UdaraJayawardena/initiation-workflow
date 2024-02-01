const { Logger } = require('@src/modules/log');

const { mapTask, mapError, getStringError } = require('@src/helper');

const handleError = (task, variables, MODULE, error, errorInfo, action) => {

  const { executionId, topicName, businessKey, processDefinitionKey } = task;

  const { mainProcessDefinitionKey } = task.variables.getAll();

  const { additionalLogInfo = null, bpmnErrorMessage = null } = errorInfo;

  const { isLogger = false, isStringError = false } = action;


  const errorStack = isStringError ? getStringError(error) : mapError(error, bpmnErrorMessage);

  const logInfo = {
    module: MODULE,
    logData: {
      errorStack: errorStack,
      infoStack: mapTask(task),
    },
  };

  if (isLogger) Logger.error(logInfo);

  let flow = processDefinitionKey;

  if (mainProcessDefinitionKey !== processDefinitionKey)
    flow = `${mainProcessDefinitionKey} / ${processDefinitionKey}`;

  const info = additionalLogInfo ? ` | ${JSON.stringify(additionalLogInfo)}` : '';

  const infoStack = `${flow}| ${businessKey}  ${info}`;

  const flowStack = `${topicName}| ${MODULE} | ${new Date()}`;

  const activeError = `${flowStack} | ERROR: ${JSON.stringify(errorStack)}`;

  console.log(`${infoStack} | ${flowStack}`, error);


  variables.set(executionId, { success: false, errorStack: errorStack });

  variables.set(`${executionId}_ErrorMessage`, `${infoStack} | ${activeError}`);

  variables.set('success', false);

  variables.set('metaData', logInfo.logData);

  variables.set('activeError', activeError);

  return variables;
};

module.exports = {
  handleError,
};
