
// const Fs = require('fs');
// const Path = require('path');
// const axios = require('axios');

// const { Config } = require('../../../../config');
// const { TE } = require('@src/helper');

// const { baseUrl } = Config.CAMUNDA;

// const _getDocumentsPath = (fileName) => Path.resolve(__dirname, '../../../../documents/', fileName);

// const _getWriter = (filePath) => Fs.createWriteStream(filePath);

// const CamundaService = axios.default.create({
//   baseURL: baseUrl + '/variable-instance'
// });

// const getVaraibleInstance = async (params) => {

//   const result = await CamundaService.get('/', {
//     params: params
//   });

//   return result.data;
// };

// const getBinaryVariableData = async (variableInstanceId) => {

//   const result = await CamundaService.get(`/${variableInstanceId}/data`, {
//     responseType: 'stream'
//   });

//   const fileName = result.data.headers['content-disposition'].split('filename=')[1];

//   const filePath = _getDocumentsPath(fileName);

//   const writer = _getWriter(filePath);

//   result.data.pipe(writer);

//   return new Promise((resolve, reject) => {
//     writer.on('finish', () => {

//       const content = Fs.readFileSync(filePath, { encoding: 'base64' });
//       Fs.unlink(filePath, () => {/*  */ });
//       resolve(content);
//     });
//     writer.on('error', (err) => reject(err));
//   });
// };

// const getAttachmentFromVariable = async (variableName, processInstanceId) => {

//   const getVariableParams = {
//     variableName: variableName,
//     processInstanceIdIn: processInstanceId,
//   };

//   const variableInstances = await getVaraibleInstance(getVariableParams);

//   const variableInstance = variableInstances.length > 0 ? variableInstances[0].id : null;

//   if (!variableInstance) TE({ code: 404, message: 'variable not found' });

//   return await getBinaryVariableData(variableInstance);
// };



// module.exports = {
//   getVaraibleInstance,
//   getBinaryVariableData,
//   getAttachmentFromVariable,
// };
