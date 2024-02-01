const axios = require('axios');
const RedisStore = require('./redis-store');

const { CAMUNDA } = require('../config').Config;

const { endSubscribe } = require('./subscriber');

const { to, TE } = require('./helper');

const { CustomCodes } = require('./constants');

const { ERROR } = require('./helper');

const { baseUrl } = CAMUNDA;

const CamundaService = axios.default.create({
  baseURL: baseUrl
});

const parseToObject = (value) => {
  try {

    return JSON.parse(value);
  } catch (error) {

    return value;
  }
};

const getValue = (value, type, key) => {
  switch (type) {
    case 'number': return { type: 'Double', value: value };
    case 'object': return {
      type: 'Object',
      value: JSON.stringify(value),
      valueInfo: {
        objectTypeName: key,
        serializationDataFormat: 'application/json'
      }
    };
    case 'file': return {
      value: JSON.stringify(value),
      type: 'Object',
      valueInfo: {
        objectTypeName: key,
        serializationDataFormat: 'application/json'
      }
    };
    default: return { type: type, value: value };
  }
};

// const getFiles = (file) => {

//   file.buffer = file.buffer.toString('base64');

//   return JSON.stringify(file);
// };

const convertObject = (object) => {

  const objKeys = Object.keys(object);

  objKeys.forEach(key => {

    let value = object[key];

    value = parseToObject(value);

    const type = typeof value;

    object[key] = getValue(value, type, key);
  });

  return object;
};

const convertFiles = (files) => {

  const object = {};

  files.forEach((file) => {

    object[file.fieldname] = getValue(file, 'file', file.fieldname);
  });

  return object;
};

const convertTOCamundaRequest = (object, files) => {

  const camundaObj = {
    variables: {},
    businessKey: object.businessKey
  };

  if (object) camundaObj.variables = { ...convertObject(object) };

  if (files) camundaObj.variables = {
    ...camundaObj.variables,
    ...convertFiles(files)
  };

  return camundaObj;
};

const bindGlobalVariable = async (req, requestId) => {

  const headers = req.headers;

  await RedisStore.setData(`${requestId}_authorization`, headers ? headers.authorization : null);
  await RedisStore.setData(`${requestId}_span`, null);
};

const handleCamundaError = err => {

  if (err.response && err.response.data) return CustomCodes.ERR_PROCESS_NOT_FOUND;
  if (err.code === 'ECONNREFUSED') return CustomCodes.ERR_TOMCAT_SERVER_OFFLINE;
  return err;
};

const Start = async (req, res) => {

  const requestId = req.requestId;

  try {

    const { key } = req.params;

    // requestId = `${key}-${uuidv4()}`;

    req.body.requestId = requestId;

    const body = convertTOCamundaRequest(req.body, req.files);

    await bindGlobalVariable(req, requestId);

    let [err, result] = await to(CamundaService.post(`/process-definition/key/${key}/start`, body, {
      auth: CAMUNDA.auth
    }));

    if (err) TE(handleCamundaError(err));

    if (!result) TE('Process result not found');

    [err, result] = await to(endSubscribe(key, requestId, res));

    if (err) TE(err);

  } catch (error) {
    
    ERROR(res, error, requestId);
  }
};

module.exports = Start;