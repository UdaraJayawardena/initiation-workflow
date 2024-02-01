const Tracer = require('./tracer');

const uuidv4 = require('uuid/v4');

const fs = require('fs');

const path = require('path');

const { ERROR } = require('./helper');

const { Config } = require('../config');

const { ALLOW_HEADERS, ALLOWED_DOMAINS, ALLOW_METHODS } = Config.ACCESS_HEADERS;

const _mappingFileData = (file) => ({
  fieldName: file.fieldName,
  fileName: file.fileName,
  size: file.size,
  type: file.type,
  dataUrl: file.dataUrl
});

const accessHeader = (req, res, next) => {

  if (ALLOWED_DOMAINS.indexOf(req.headers.origin) !== -1) {

    res.header('Access-Control-Allow-Origin', req.headers.origin);

    res.header('Access-Control-Allow-Methods', ALLOW_METHODS);

    res.header('Access-Control-Allow-Headers', ALLOW_HEADERS);
  }

  next();
};

const initRoute = (message) => (req, res) => {

  res.status(200).json({

    message: message,

    application: process.env.APP_NAME,

    version: process.env.VERSION
  });
};

const initSpan = (req, res, next) => {

  try {

    const span = Tracer.createSpan(req);

    if (span) span.log({
      'event': 'initialized',
      method: 'initSpan',
      component: 'routes'
    });

    req.span = span;

    next();
  }
  catch (error) {

    ERROR(res, error);
  }
};

const getDocumentPath = (requestId) =>
  path.resolve(__dirname, `../documents/${requestId}.json`);

const storeDocuments = (req, res, next) => {

  let jsonPath = '';

  try {

    const { key } = req.params;

    const requestId = `${key}-${uuidv4()}`;

    req.requestId = requestId;

    if (!req.body.files || req.body.files.length <= 0) return next();

    const urls = {};

    jsonPath = getDocumentPath(requestId);

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

const cleanStoreDocument = (requestId) => {

  const jsonPath = getDocumentPath(requestId);

  if (jsonPath && fs.existsSync(jsonPath)) {

    fs.unlinkSync(jsonPath);
  }
};

const _404 = (req, res) => {
  res.status(404).json({
    code: 404,
    message: 'NOT_FOUND',
    success: false,
    error: {
      errmsg: 'Route' + req.url + ' Not found.',
      code: 404
    }
  });
};

const _500 = (err, req, res) => {
  res.status(500).send({
    code: 500,
    error: err
  });
};

module.exports = {

  accessHeader,

  initRoute,

  getDocumentPath,

  storeDocuments,

  cleanStoreDocument,

  initSpan,

  _404,

  _500
};