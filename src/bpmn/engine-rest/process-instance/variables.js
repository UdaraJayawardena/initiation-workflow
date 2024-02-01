
const Fs = require('fs');

const Path = require('path');

const axios = require('../axios');

const { Config } = require('../../../../config');

const { baseUrl } = Config.CAMUNDA;

const instanceBaseURL = `${baseUrl}/process-instance`;

const _getDocumentsPath = (fileName) => Path.resolve(__dirname, '../../../../documents/', fileName);

const _getWriter = (fileName) => Fs.createWriteStream(_getDocumentsPath(fileName));

const getBinary = async ({ processInstanceId, variableName }, auth) => {

  const url = `${instanceBaseURL}/${processInstanceId}/variables/${variableName}/data`;

  const result = await axios.get(url, { responseType: 'stream' }, { auth });

  const fileName = result.data.headers['content-disposition'].split('filename=')[1];

  const writer = _getWriter(fileName);

  result.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
};

module.exports = {
  getBinary,
};
