const { ERROR, SUCCESS, TE } = require('@src/helper');

const { CustomCodes } = require('./constants');

const { ProcessDefinition } = require('../../../bpmn').EngineRest;

const startInstanceByKey = async (req, res) => {

  try {

    if (!req.body.key) TE(CustomCodes.ERR_PROCESS_DEF_KEY_NOT_FOUND);
    if (!req.body.businessKey) TE(CustomCodes.ERR_PROCESS_DEF_KEY_NOT_FOUND);

    const response = await ProcessDefinition.startByKey(req.body, req.camundaAuth);

    SUCCESS(res, CustomCodes.SUCCESS, response.data, req.requestId);
  }
  catch (error) {
    ERROR(res, error, req.requestId);
  }
};

const startInstanceById = async (req, res) => {

  try {

    if (!req.body.id) TE(CustomCodes.ERR_PROCESS_DEF_KEY_NOT_FOUND);
    if (!req.body.businessKey) TE(CustomCodes.ERR_PROCESS_DEF_KEY_NOT_FOUND);

    const response = await ProcessDefinition.startById(req.body, req.camundaAuth);

    SUCCESS(res, CustomCodes.SUCCESS, response.data, req.requestId);
  }
  catch (error) {
    ERROR(res, error, req.requestId);
  }
};


const startInstanceByKeyForTenant = async (req, res) => {

  try {

    if (!req.body.key) TE(CustomCodes.ERR_PROCESS_DEF_KEY_NOT_FOUND);
    if (!req.body.tenantId) TE(CustomCodes.ERR_TENANT_ID_NOT_FOUND);

    const response = await ProcessDefinition.startByKeyForTenant(req.body, req.camundaAuth);

    SUCCESS(res, CustomCodes.SUCCESS, response.data, req.requestId);
  } catch (error) {

    ERROR(res, error, req.requestId);
  }
};


module.exports = {
  startInstanceByKey,
  startInstanceById,
  startInstanceByKeyForTenant,
};