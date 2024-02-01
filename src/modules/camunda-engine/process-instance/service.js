
// const Fs = require('fs');
// const Path = require('path');
// const axios = require('axios');

// const { Config } = require('../../../../config');

// const { baseUrl } = Config.CAMUNDA;

// const _getDocumentsPath = (fileName) => Path.resolve(__dirname, '../../../../documents/', fileName);

// const _getWriter = (fileName) => Fs.createWriteStream(_getDocumentsPath(fileName));

// const CamundaService = axios.default.create({
//   baseURL: baseUrl + '/process-instance'
// });

// const getBinaryVariableData = async ({ processInstanceId, variableName }) => {

//   const result = await CamundaService.get(`/${processInstanceId}/variables/${variableName}/data`, {
//     responseType: 'stream'
//   });

//   const fileName = result.data.headers['content-disposition'].split('filename=')[1];

//   const writer = _getWriter(fileName);

//   result.data.pipe(writer);

//   return new Promise((resolve, reject) => {
//     writer.on('finish', resolve);
//     writer.on('error', reject);
//   });

//   // return result.data;
// };



// module.exports = {
//   getBinaryVariableData,
// };
