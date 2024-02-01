const { Client, logger, Variables, BasicAuthInterceptor } = require('camunda-external-task-client-js');

const { CAMUNDA } = require('../config').Config;

const { parseToObject } = require('./helper');

const ProcessDefinition = require('./bpmn').processDefinition;

const { to, SUCCESS, ERROR } = require('./helper');

const { CustomCodes } = require('./constants');

const { cleanStoreDocument } = require('./init');

const responseList = [];

const endSubscriptions = [];

const basicAuthentication = new BasicAuthInterceptor(CAMUNDA.auth);

const client = new Client({
  baseUrl: CAMUNDA.baseUrl,
  asyncResponseTimeout: CAMUNDA.asyncResponseTimeout,
  use: logger,
  interceptors: basicAuthentication
});

const subscribeAll = require('./subscribers');

const getResponse = (requestId) => {

  const index = responseList.findIndex(
    res => res.requestId === requestId);

  let response = null;

  if (index > -1) {

    response = responseList[index];

    responseList.splice(index, 1);
  }

  return response;
};

const subscribe = async () => {

  initSubscribe();

  queueSubscribe();

  createUpdateLoop();

  test();

  await subscribeAll(client);
};

const initSubscribe = () => {

  client.subscribe('init', async function ({ task, taskService }) {

    const variables = new Variables();

    const taskVariables = task.variables.getAll();

    Object.keys(taskVariables).forEach(key => {

      const value = parseToObject(taskVariables[key]);

      variables.set(key, value);
    });

    // variables.set('rootProcessInstanceId', task.processInstanceId);

    await taskService.complete(task, variables);
  });
};

const endSubscribe = async (topic, requestId, res) => {

  return new Promise((resolve) => {

    responseList.push({ requestId: requestId, res: res });

    const endTopic = `end-${topic}`;

    const findEndSubscription = endSubscriptions.find(
      subscription => subscription.topic === endTopic);

    if (!findEndSubscription) {

      const endSubscription = client.subscribe(endTopic, async function ({ task, taskService }) {

        const { success, error, result, requestId } = task.variables.getAll();

        cleanStoreDocument(requestId);

        await taskService.complete(task);

        if (success) {

          resolvedRequest(requestId, result);
        } else {

          resolvedRequest(requestId, null, error);
        }
      });

      endSubscriptions.push({ topic: endTopic, subscriptioneRef: endSubscription });
    }

    const resolvedRequest = (requestId, result, err) => {

      const response = getResponse(requestId);

      if (response) {

        const { res } = response;

        if (result) {

          try { result = JSON.parse(result); } catch (error) { /*  */ }

          SUCCESS(res, CustomCodes.SUCCESS, result, requestId);

          return resolve(result);
        }

        if (err) {

          ERROR(res, err, requestId);

          return resolve(err);
        }

        ERROR(res, CustomCodes.ERR_BPMN_RESOLVE, requestId);

        return resolve(err);
      }
    };
  });
};

const queueSubscribe = () => {

  const variables = new Variables();

  client.subscribe('start-queue', async function ({ task, taskService }) {

    try {

      const key = task.variables.get('key');

      const params = task.variables.get('params');

      const [err] = await to(ProcessDefinition.startProcessDefinitionByKey(key, params));

      if (err) {

        console.log(err);
      }

      await taskService.complete(task, variables);

    } catch (error) {

      await taskService.complete(task, variables);
    }
  });
};

const createUpdateLoop = () => {

  client.subscribe('create-update-loop', async function ({ task, taskService }) {

    const variables = new Variables();

    try {

      const dataType = task.variables.get('dataType');
      const outputVariable = task.variables.get('outputVariable') || 'data';
      const loopName = task.variables.get('loopName') || 'loop';

      const dataList = task.variables.get(dataType);

      let index = task.variables.get(loopName + 'index');

      index = index !== undefined ? index + 1 : 0;

      if (dataList.length === 0) {
        variables.set(outputVariable, null);
        variables.set(loopName + 'IsComplete', true);
        variables.set('success', true);
        variables.set('result', 'No ' + dataType + ' found');
        return await taskService.complete(task, variables);
      }

      const data = dataList[index];

      variables.set(loopName + 'index', index);
      variables.set(outputVariable, data);
      variables.set(loopName + 'IsComplete', dataList.length === (index + 1));
      await taskService.complete(task, variables);

    } catch (error) {

      variables.set('error', error);
      variables.set('success', false);
    }
  });
};

const test = () => {

  client.subscribe('test', async function ({ task, taskService }) {
    const variables = new Variables();

    try {
      const test = task.variables.get('test');
      console.log('test***', test);
      variables.set('result', test);
      variables.set('success', true);
      await taskService.complete(task, variables);

    } catch (error) {

      variables.set('error', error);
      variables.set('success', false);
    }
  });
};

module.exports = {

  subscribe,
  endSubscribe,
  createUpdateLoop,
};