const Constants = require('../constants');

const _setCode = (code, httpCode) => ({
  mc: '', // module_code
  code: code, // custom_code
  hc: httpCode, // http_code
});

const ERRORS = {
  UNAUTHORIZED_REQUEST: { ..._setCode(1, 401), message: 'unauthorized request' },
};

module.exports = {

  CoreConstant: Constants,

  ERRORS,
};