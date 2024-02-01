const { ERROR, SUCCESS } = require('@src/helper');

const { CustomCodes } = require('./constants');

const { Deployment } = require('../../../bpmn').EngineRest;

const createList = async (req, res) => {

  try {

    const response = await Deployment.createList();

    SUCCESS(res, CustomCodes.SUCCESS, response, req.requestId);
  }
  catch (error) {
    ERROR(res, error, req.requestId);
  }
};

const deleteList = async (req, res) => {

  try {

    const response = await Deployment.deleteList();

    SUCCESS(res, CustomCodes.SUCCESS, response, req.requestId);
  }
  catch (error) {
    ERROR(res, error, req.requestId);
  }
};

const getList = async (req, res) => {

  try {

    const response = await Deployment.getList();

    SUCCESS(res, CustomCodes.SUCCESS, response, req.requestId);
  }
  catch (error) {
    ERROR(res, error, req.requestId);
  }
};

module.exports = {
  createList,
  deleteList,
  getList
};