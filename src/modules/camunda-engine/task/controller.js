const { ERROR, SUCCESS, TE } = require('@src/helper');

const { CustomCodes } = require('./constants');

// const Service = require('./service');

const { Task } = require('../../../bpmn').EngineRest;

const claim = async (req, res) => {

  try {

    if (!req.body.id) TE(CustomCodes.ERR_TASK_ID_NOT_FOUND);

    const response = await Task.claim(req.body, req.camundaAuth);

    SUCCESS(res, CustomCodes.SUCCESS, response.data, req.requestId);
  }
  catch (error) {
    ERROR(res, error, req.requestId);
  }
};

const complete = async (req, res) => {

  try {

    if (!req.body.id) TE(CustomCodes.ERR_TASK_ID_NOT_FOUND);

    const response = await Task.complete(req.body, req.camundaAuth);

    SUCCESS(res, CustomCodes.SUCCESS, response.data, req.requestId);
  }
  catch (error) {
    ERROR(res, error, req.requestId);
  }
};

const claimAndComplete = async (req, res) => {

  try {

    if (!req.body.id) TE(CustomCodes.ERR_TASK_ID_NOT_FOUND);

    await Task.claim(req.body, req.camundaAuth);

    const response = await Task.complete(req.body, req.camundaAuth);

    SUCCESS(res, CustomCodes.SUCCESS, response.data, req.requestId);
  }
  catch (error) {
    ERROR(res, error, req.requestId);
  }
};

module.exports = {
  claim,
  complete,
  claimAndComplete,
};