const fs = require('fs');
const path = require('path');
const uuidv4 = require('uuid/v4');

const { ERROR } = require('../../helper');

/* Helper Functions */

const getDocumentPath = (requestId) =>
  path.resolve(__dirname, `../../../documents/${requestId}.json`);

const _mappingFileData = (file) => ({
  fieldName: file.fieldName,
  fileName: file.fileName,
  size: file.size,
  type: file.type,
  dataUrl: file.dataUrl
});

/***Helper Functions End***/

const createRequestId = async (req, res, next) => {

  try {

    const { key, id } = req.params;

    const requestId = `${(key || id)}-${uuidv4()}`;

    req.requestId = requestId;

    next();
  }
  catch (error) {

    ERROR(res, error);

  }
};

const bindAuthTokenToVariables = async (req, res, next) => {

  try {

    const headers = req.headers;
    const { variables } = req.body;

    const authToken = headers ? headers.authorization : undefined;

    if (variables) variables['authToken'] = { type: 'String', value: authToken };

    next();

  } catch (error) {

    ERROR(res, error);
  }
};

const bindSpanWithRequest = (req, res, next) => {

  try {

    if (!req.span) return next();
    if (!global.requestList) global.requestList = [];

    const headers = req.headers;

    global.requestList.push({
      id: req.requestId,
      span: req.span,
      authorization: headers ? headers.authorization : null
    });
    next();
  }
  catch (error) {
    ERROR(res, error);
  }
};

const storeDocuments = (req, res, next) => {

  let jsonPath = '';

  try {

    if (!req.body.files || req.body.files.length <= 0) return next();

    const urls = {};

    jsonPath = getDocumentPath(req.requestId);

    for (let i = 0; i < req.body.files.length; i++) {
      const file = req.body.files[i];

      const { parentName, childName } = file;

      if (!urls[parentName]) urls[parentName] = {};

      urls[parentName][childName] = _mappingFileData(file);
      req.body[parentName][childName] = jsonPath;
    }

    fs.writeFileSync(jsonPath, JSON.stringify(urls, null, 4));

    if (req.body.files) delete req.body.files;

    next();
  } catch (error) {

    if (jsonPath && fs.existsSync(jsonPath)) {

      fs.unlinkSync(jsonPath);
    }

    ERROR(res, error);
  }
};

module.exports = {
  createRequestId,
  storeDocuments,
  bindAuthTokenToVariables,
  bindSpanWithRequest,
};