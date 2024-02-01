// ##################################################################
// #  File Name: helper.js                                          #
// #                                                                #
// #  Description: helper have a two function to and TE             #
// #                                                                #
// #  Ex:- to()                                                     #
// #  const [err, result] = await to(Call Promise function);        #
// #                                                                #
// #  Commented By: Lasantha Lakmal                                 #
// ##################################################################

const { CUSTOM_CODE } = require('./errors');

const Sentry = require('@sentry/node');

const Tracer = require('./tracer');

const _spanFinished = (id, response, err) => {

  if (!id) return;

  if (err) {

    const stack = err.stack ? err.stack : null;
    Tracer.createErrorLog(id, response, stack);
  } else {

    Tracer.createLog(id, 'finished', {
      method: 'success',
      component: 'helper'
    });
  }

  Tracer.finishedSpan(id);
};

// const ERROR_CODE = {

//   // ECONNREFUSED: (e) => { return { code: 500, errmsg: e.message }; },
//   ECONNREFUSED: (e) => CUSTOM_CODE._500(e),
// };

/**
 * Convert promise call result to array
 * @param {Promise} promise - promise object
 * 
 * @returns {[]} Return [err, data] array
 */
const to = (promise) => {

  return promise

    .then(data => {

      return [null, data];
    }).catch(err =>

      [err]
    );
};

/**
 * Throw error and if isLog is true, create a log
 * @param {*} err - Any kind of error
 * @param {boolean} isLog - Error log or not
 */
const TE = (err, isLog) => {

  if (isLog) {

    console.error(err);
  }

  throw err;
};

const parseToObject = (value) => {

  try {

    return JSON.parse(value);
  } catch (error) {

    return value;
  }
};

const createUrl = (baseUrl) => (path) => (baseUrl + path);

const createQueryParams = (params) => {

  let queryString = '';

  for (const key of Object.keys(params)) {
    queryString += key + '=' + params[key] + '&';
  }

  return queryString.slice(0, queryString.length - 1);
};

/**
 * Create succes response
 * @param {Response} res - Response object
 * @param {number} code - Http Sucess code
 * @param {*} data - Final result. object, array ...
 * @return {Object} Return HTTP Response: {
 *  code: 200,
 *  data: (*),
 *  success: true
 * }
 */
const SUCCESS = (res, codeObj, data, id) => {

  const { hc, code, message } = codeObj;

  _spanFinished(id);

  let response = CUSTOM_CODE._200(data);

  if (hc && code && message) {
    response = CUSTOM_CODE[`_${hc}`](data, codeObj);
  }

  return res.status(response.httpCode).json(response);
};

/**
 * Create error response
 * @param {Response} res - Response object
 * @param {Object} error - Error object
 * @return {Object} Return HTTP Response
 */
const ERROR = (res, err, id) => {

  try {

    let response = CUSTOM_CODE._500(err);

    if (err && err.hc && err.message && err.isBPMN) {
      response = CUSTOM_CODE[`_${err.hc}`](err);
    } else if (err && err.code && err.httpCode && err.message) {
      response = err;
    }

    _spanFinished(id, response, err);

    if (response.httpCode === 500) {
      Sentry.captureException(err);
    }

    return res.status(response.httpCode).json(response);

  } catch (catchErr) {

    console.log('****', catchErr);

    Sentry.captureException(err);

    const response = CUSTOM_CODE._400(err);

    _spanFinished(id, response, catchErr);

    return res.status(response.httpCode).json(response);
  }
};

const getErrorLog = (task) => {

  const result = task.variables.get('errorLog');

  if (!result) return [];

  return result;
};

const getProcessIdentifiers = (task) => {

  const result = task.variables.get('processIdentifiers');

  if (!result) return {};

  return result;
};

const mapTask = (task) => ({
  processDefinitionKey: task.processDefinitionKey,
  processDefinitionId: task.processDefinitionId,
  processInstanceId: task.processInstanceId,
  businessKey: task.businessKey,
  topicName: task.topicName,
  executionId: task.executionId,
  // rootProcessInstanceId: task.variables.get('rootProcessInstanceId')
});

const mapError = (err, message) => {

  const error = { 
    message: message,
    stack: err.stack,
    errorInfo: err.errorInfo
  };

  if (typeof err === 'string'){
    error.error = err;
    return error;
  }

  if (err.message) {
    error.error = err.message;
    return error;
  }

  if (err.message && err.code) {
    error.error = err.message;
    error.code = err.code;
    return error;
  }

  if (err.error) {
    error.error = err.error;
    return error;
  }

  if (typeof err === 'object') {
    error.error = JSON.stringify(err);
    return error;
  }

  console.error(err);

  error.error = 'unknown error, please check initiation-workflow consol log manual';
  return error;
};

const getStringError = (err) => {

  if (typeof err === 'string') return err;

  if (err.error && err.error.errmsg) return err.error.errmsg;

  if (err.stack) return err.stack;

  if (err.message) return err.message;

  if (typeof err === 'object') {

    return JSON.stringify(err);
  }

  console.log(err);

  return 'unknown error, please check initiation-workflow consol log manual';
};

const getToken = (task) => ({
  headersKey: {
    authToken: task.variables.get('authToken'),
    reqId: task.variables.get('requestId')
  }
});

/**
 * @module helper
 */
module.exports = {
  to: to,
  TE: TE,
  parseToObject,
  SUCCESS,
  ERROR,
  createUrl,
  createQueryParams,
  getErrorLog,
  getProcessIdentifiers,
  mapTask,
  mapError,
  getStringError,
  getToken
};