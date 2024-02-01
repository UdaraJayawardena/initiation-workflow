const FormData = require('form-data');

const fs = require('fs');

const { V_TIGER } = require('@config').Config;

const BASE_URL = V_TIGER.baseUrl;

const ACCESS_KEY = V_TIGER.accessKey;

const USER_NAME = V_TIGER.userName;

const AUTH_ERROR = {

  success: false,

  error: {

    code: 'INVALID_SESSIONID',

    message: 'Session Identifier provided is Invalid'
  }
};

const getUrl = (operation) =>
  `${BASE_URL}/restapi/v1/vtiger/default/${operation}`;

const getAuthToken = () => {
  const key = USER_NAME + ':' + ACCESS_KEY;
  const token = Buffer.from(key).toString('base64');
  if (token) return `Basic ${token}`;
  throw AUTH_ERROR;
};

const getDocumentData = (element, elementType, filePath) => {

  const form = new FormData();

  const fileBuffer = fs.readFileSync(filePath);

  form.append('elementType', elementType);
  form.append('element', element);
  form.append('filename', fileBuffer);

  const headers = {
    'content-type': `multipart/form-data; boundary=${form._boundary}`,
    'Content-Length': fs.statSync(filePath)['size']
  };

  return { data: form, config: { headers } };
};

const getObjectData = (element, elementType) => {

  const headers = {
    Authorization: getAuthToken(),
    'Content-Type': 'application/x-www-form-urlencoded'
  };

  const data = `elementType=${elementType}&element=` +
    encodeURIComponent(JSON.stringify(element));

  return { data: data, config: { headers } };
};

const getCreateData = (element, elementType, filePath) => {

  if (elementType === 'Documents') {
    return getDocumentData(element, elementType, filePath);
  }

  return getObjectData(element, elementType);
};

module.exports = {
  getUrl,
  getAuthToken,
  getDocumentData,
  getObjectData,
  getCreateData
};