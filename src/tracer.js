const RedisStore = require('./redis-store');
const { TRACER, FORMAT_HTTP_HEADERS } = require('../config').Jeager;

const { SYSTEM, APPLICATION } = require('../config').Config;

const injectHeader = async ({ reqId, authToken }, headers) => {

  if (!headers) headers = {};

  if (reqId) {

    const authorization = await RedisStore
      .getData(`${reqId}_authorization`);

    RedisStore.getData(`${reqId}_span`)
      .then(span => {
        if (span) TRACER.inject(span, FORMAT_HTTP_HEADERS, headers);
      });

    if (authorization) headers.authorization = authorization;
  }
  else if (authToken) {

    headers.authorization = authToken;
  }
  else {
    headers.authorization = SYSTEM.token;
  }

  return headers;
};

/**
 * Creates the Span object using the request object
 * @param {object} req Request object
 * @returns Span
 */
const createSpan = req => {

  if (APPLICATION.ENV === 'test') return;

  if (!req) throw 'span request not found';

  const parentContext = TRACER.extract(FORMAT_HTTP_HEADERS, req.headers);

  const name = `${req.method} ${req.baseUrl}${req.path}`;

  const options = {
    tags: {
      'span.kind': 'server',
      'component': 'crm-management',
      'http.method': req.method,
      'http.url': req.url
    }
  };

  if (parentContext) {
    options.childOf = parentContext;
  }

  return TRACER.startSpan(name, options);
};

const finishedSpan = id => {

  if (id) {

    RedisStore.getData(`${id}_span`)
      .then(span => {
        if (span) span.finish();
      });

    RedisStore.deleteData(`${id}_span`)
      .catch(e => console.log(e));
  }
};

/**
 * Creates a log trace using `Jaeger OpenTrace`
 * @param {Span} span - Jaeger Span Object
 * @param {string} methodName - Name of the function
 * @param {string} layer - [`Controller`, `Service`, `Database`]
 * @param {string} description - Description of the function
 */
const createLog = (id, event, data) => {

  if (APPLICATION.ENV === 'test') return;

  const { method, component } = data;

  if (event === 'error')
    throw 'Please use createErrorLog';

  if (!id || !method || !component)
    throw 'please fill the required parameters to create the log';

  RedisStore.getData(`${id}_span`)
    .then(span => {
      if (span) {

        span.log({
          'event': event,
          ...data
        });
      }
    });
};

/**
 * Creates an error log in the trace using `Jaeger OpenTrace`
 * @param {Span} span Jaeger Span Object
 * @param {number} code Erro code
 * @param {string} message Error Message
 * @param {any} error Error data object
 */
const createErrorLog = (id, error, stack) => {

  if (APPLICATION.ENV === 'test') return;

  const { code, message } = error;

  if (!id)
    throw 'please fill the required parameters to create the error log';

  RedisStore.getData(`${id}_span`)
    .then(span => {
      if (span) {

        span.setTag('error', true);
        span.setTag('http.status_code', code);
        span.log({
          'event': 'error',
          'error.object': error,
          'message': message,
          'stack': stack
        });
      }
    });
};

module.exports = {
  injectHeader,
  createSpan,
  finishedSpan,
  createLog,
  createErrorLog
};
