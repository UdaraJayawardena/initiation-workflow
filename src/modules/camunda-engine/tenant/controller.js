const { ERROR, SUCCESS } = require('@src/helper');

const { CustomCodes } = require('./constants');

const SeedData = require('./seed-data');

const { Tenant } = require('../../../bpmn').EngineRest;

const create = async (req, res) => {

  try {

    const response = await Tenant.create(req.body, req.camundaAuth);

    SUCCESS(res, CustomCodes.SUCCESS, response, req.requestId);
  }
  catch (error) {
    ERROR(res, error, req.requestId);
  }
};

const seed = async (req, res) => {

  try {

    const responseList = [];

    for (let i = 0; i < SeedData.length; i++) {
      const data = SeedData[i];
      const response = await Tenant.create(data, req.camundaAuth);
      responseList.push(response);
    }

    SUCCESS(res, CustomCodes.SUCCESS, responseList, req.requestId);
  }
  catch (error) {
    ERROR(res, error, req.requestId);
  }
};

const del = async (req, res) => {

  try {

    const { tenantId } = req.params;

    const response = await Tenant.del(tenantId, req.camundaAuth);

    SUCCESS(res, CustomCodes.SUCCESS, response, req.requestId);
  }
  catch (error) {
    ERROR(res, error, req.requestId);
  }
};

const getList = async (req, res) => {

  try {

    const response = await Tenant.getList({}, req.camundaAuth);

    SUCCESS(res, CustomCodes.SUCCESS, response, req.requestId);
  }
  catch (error) {
    ERROR(res, error, req.requestId);
  }
};

module.exports = {
  create,
  seed,
  // createList,
  del,
  // deleteList,
  getList
};