
const { Variables } = require('camunda-external-task-client-js');

const { AWSService } = require('../../../services');

const { SQSService } = AWSService;

const { Config } = require('../../../../config');

const { createJiraTicketQueueUrl } = Config.AWS_CONFIGS;

const { handleError } = require('@src/helper');

const publishErrorForCreatingJiraTicket = async ({ task, taskService }) => {
  let variables = new Variables();

  const { activeError } = task.variables.getAll();

  const { businessKey, processDefinitionKey } = task;

  const ERROR = 'Unexpected error occurred while publishing error to queue';

  try {

    const errorArr = activeError ? activeError.split('|') : null;

    const createJiraTicketData = {
      businessKey: businessKey,
      flowName: processDefinitionKey,
      topicName: errorArr && errorArr[0] ? errorArr[0] : '',
      date: errorArr && errorArr[1] ? errorArr[1] : '',
      error: errorArr && errorArr[2] ? errorArr[2] : '',
    };

    await SQSService.sendMessage(
      createJiraTicketData,
      createJiraTicketQueueUrl
    );

    await taskService.complete(task, variables);

  } catch (error) {

    variables = handleError(task, variables, processDefinitionKey, error, { bpmnErrorMessage: ERROR }, { isLogger: false });

    const errorCode = 'ERROR_PUBLISH_ERROR_FOR_CREATE_JIRA_TICKET';

    await taskService.handleBpmnError(task, errorCode, ERROR, variables);
  }
};

module.exports = {
  publishErrorForCreatingJiraTicket,
};
