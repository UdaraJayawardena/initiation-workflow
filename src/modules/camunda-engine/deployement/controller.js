const { ERROR, SUCCESS } = require('@src/helper');

const { CustomCodes } = require('./constants');

const { Deployment } = require('../../../bpmn').EngineRest;

const create = async (req, res) => {

  try {

    const { pathList } = req.body;

    const response = await Deployment.create(null, pathList, req.camundaAuth);

    SUCCESS(res, CustomCodes.SUCCESS, response, req.requestId);
  }
  catch (error) {
    ERROR(res, error, req.requestId);
  }
};

const createList = async (req, res) => {

  try {

    const response = await Deployment.createList(null, req.camundaAuth);

    SUCCESS(res, CustomCodes.SUCCESS, response, req.requestId);
  }
  catch (error) {
    ERROR(res, error, req.requestId);
  }
};

const redeploy = async (req, res) => {

  try {

    const { deploymentId } = req.params;

    const response = await Deployment.redeploy(deploymentId, req.body, req.camundaAuth);

    SUCCESS(res, CustomCodes.SUCCESS, response, req.requestId);
  }
  catch (error) {
    ERROR(res, error, req.requestId);
  }
};

const del = async (req, res) => {

  try {

    const { idList } = req.body;

    const response = await Deployment.del(idList, req.camundaAuth);

    SUCCESS(res, CustomCodes.SUCCESS, response, req.requestId);
  }
  catch (error) {
    ERROR(res, error, req.requestId);
  }
};

const deleteList = async (req, res) => {

  try {

    const response = await Deployment.deleteList(req.camundaAuth);

    SUCCESS(res, CustomCodes.SUCCESS, response, req.requestId);
  }
  catch (error) {
    ERROR(res, error, req.requestId);
  }
};

const getList = async (req, res) => {

  try {

    const response = await Deployment.getList({}, req.camundaAuth);

    SUCCESS(res, CustomCodes.SUCCESS, response, req.requestId);
  }
  catch (error) {
    ERROR(res, error, req.requestId);
  }
};

const getResourceList = async (req, res) => {

  try {

    const { deploymentId } = req.params;

    const response = await Deployment.getResources(deploymentId, req.camundaAuth);

    SUCCESS(res, CustomCodes.SUCCESS, response, req.requestId);
  }
  catch (error) {
    ERROR(res, error, req.requestId);
  }
};

module.exports = {
  create,
  createList,
  redeploy,
  del,
  deleteList,
  getList,
  getResourceList
};