
const Fs = require('fs');

const Path = require('path');

const axios = require('../axios');

const { Config } = require('../../../../config');

const { TE } = require('@src/helper');

const { baseUrl } = Config.CAMUNDA;

const instanceBaseURL = `${baseUrl}/variable-instance`;

const _getDocumentsPath = (fileName) => Path.resolve(__dirname, '../../../../documents/', fileName);

const _getWriter = (filePath) => Fs.createWriteStream(filePath);

const get = async (params, auth) => {

  const result = await axios.get(instanceBaseURL, {
    params: params,
    auth
  });

  return result;
};

const getBinary = async (variableInstanceId, auth) => {

  const result = await axios.get(`${instanceBaseURL}/${variableInstanceId}/data`, {
    responseType: 'stream',
    auth
  });

  const fileName = result.headers['content-disposition'].split('filename=')[1];

  const filePath = _getDocumentsPath(fileName);

  const writer = _getWriter(filePath);

  result.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', () => {

      const content = Fs.readFileSync(filePath, { encoding: 'base64' });
      Fs.unlink(filePath, () => {/*  */ });
      resolve(content);
    });
    writer.on('error', (err) => reject(err));
  });
};

const getAttachmentFrom = async (variableName, processInstanceId, auth) => {

  const getVariableParams = {
    variableName: variableName,
    processInstanceIdIn: processInstanceId,
  };

  const variableInstances = await get(getVariableParams, auth);

  const variableInstance = variableInstances.length > 0 ? variableInstances[0].id : null;

  if (!variableInstance) TE({ code: 404, message: 'variable not found' });

  return await getBinary(variableInstance, auth);
};

module.exports = {
  get,
  getBinary,
  getAttachmentFrom,
};
