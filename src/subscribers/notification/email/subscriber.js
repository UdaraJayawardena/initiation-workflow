const { Variables } = require('camunda-external-task-client-js');

const { Notifications } = require('@src/services');

const { to, mapTask, getStringError, mapError, TE, getErrorLog } = require('@src/helper');

// const { APPLICATION } = require('@config').Config;

const MODULE = 'SEND_NOTIFICATIONS';

const { Logger } = require('@src/modules/log');

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


const sendNotifications = async ({ task, taskService }) => {

  let variables = new Variables();

  const errorLog = getErrorLog(task);

  const ERROR = 'Unexpected Error Occurred while send notification emails';

  const { emailData, onTimeSend } = task.variables.getAll();

  try {

    if(emailData){

      const params = { onTimeSend : (onTimeSend == 'true')?true: false };
    
      const [err, email] = await to(Notifications.emails.sendEmail(emailData, params));
 
      if (err) TE({ name: 'ERROR_SEND_EMAIL', message: err.toString() });
 
      if (!email) TE({ name: 'ERROR_EMAIL_RESULT_NOT_FOUND', message: 'New email not found' });
    }

    await taskService.complete(task, variables);

  } catch (error) {

    variables = _handleError(task, variables, errorLog, error, ERROR);

    const errorCode = 'ERROR_SEND_NOTIFICATION_EMAIL';

    await taskService.handleBpmnError(task, errorCode, ERROR, variables);
    
  }
};

module.exports = {

  sendNotifications 
};
