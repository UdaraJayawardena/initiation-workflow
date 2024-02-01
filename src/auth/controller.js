const { to, TE, ERROR } = require('../helper');

const Service = require('./service');

const { ERRORS } = require('./constant');

const HEADERS_LIST = ['Authorization'];

const _extractToken = (req) => {

  const headers = {};

  for (const headerName of HEADERS_LIST) {
    if (!req.get(headerName)) TE(ERRORS.UNAUTHORIZED_REQUEST);

    headers[headerName] = req.get(headerName);
  }

  return headers;
};

/* Check authorization */
const isAuthorized = async (req, res, next) => {

  try {

    const headers = _extractToken(req);

    if (!headers) TE(ERRORS.UNAUTHORIZED_REQUEST);

    const [authError, authorization] = await to(Service.isAuthorized(headers));

    if (authError) TE(authError);

    if (authorization && authorization.hasAuthorize) {

      // req.user = authorization.userDetails;

      const user = authorization.userDetails;

      req.camundaAuth = {
        username: user.userName,
        password: user.camundaPassword
      };

      next();

    } else {
      // TE({ code: 4011, message: 'Invalid request' });
      TE(ERRORS.UNAUTHORIZED_REQUEST);
    }

  } catch (error) {
    ERROR(res, error);
  }
};

/* Check authentication */
const isAuthenticated = async (req, res, next) => {
  try {

    const headers = _extractToken(req);

    const accessLevels = req.body.accessLevels;

    if (!headers) {
      TE(ERRORS.UNAUTHORIZED_REQUEST);

    } else {

      const [authError, authorization] = await to(Service.isAuthenticated(accessLevels, headers));

      if (authError) TE(authError);

      if (authorization && authorization.hasPermission) {
        next();

      } else {
        TE(ERRORS.UNAUTHORIZED_REQUEST);
      }

    }

  } catch (error) {
    ERROR(res, error);
  }
};

module.exports = {
  isAuthorized,
  isAuthenticated,
};