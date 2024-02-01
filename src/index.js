const helmet = require('helmet');

const swaggerJSDoc = require('swagger-jsdoc');

const Sentry = require('@sentry/node');

const Tracing = require('@sentry/tracing');

const swaggerUi = require('swagger-ui-express');

const express = require('express');

const app = express();

const bodyParser = require('body-parser');

const cookieParser = require('cookie-parser');

const router = require('./router');

const { Config } = require('../config');

const { JSON_PARSER, URLENCODED } = Config.BODYPARSER;

const { ALLOW_HEADERS, ALLOWED_DOMAINS, ALLOW_METHODS } = Config.ACCESS_HEADERS;

const { DEFINITION } = Config.SWAGGER;

const options = {
  swaggerDefinition: DEFINITION,
  apis: [
    './src/router.yaml',
    './src/modules/log/swagger/*.yaml',
    './src/modules/process/swagger/*.yaml',
    './src/modules/process-status/swagger/*.yaml'
  ]
};

const swaggerSpec = swaggerJSDoc(options);

const getAPIJson = (req, res) => {

  res.setHeader('Content-Type', 'application/json');

  res.send(swaggerSpec);
};

const accessHeader = (req, res, next) => {

  if (ALLOWED_DOMAINS.indexOf(req.headers.origin) !== -1) {

    res.header('Access-Control-Allow-Origin', req.headers.origin);

    res.header('Access-Control-Allow-Methods', ALLOW_METHODS);

    res.header('Access-Control-Allow-Headers', ALLOW_HEADERS);
  }

  next();
};

Sentry.init({
  dsn: Config.APPLICATION.SENTRY_DSN,
  environment: Config.APPLICATION.SENTRY_ENVIRONMENT,
  tracesSampleRate: Config.APPLICATION.SENTRY_SAMPLERATE,
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Tracing.Integrations.Express({
      // to trace all requests to the default router
      app,
      // alternatively, you can specify the routes you want to trace:
      // router: someRouter,
    }),
  ],
});

// RequestHandler creates a separate execution context using domains, so that every
// transaction/span/breadcrumb is attached to its own Hub instance
app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

app.use(helmet());

app.use(bodyParser.json(JSON_PARSER));

app.use(bodyParser.urlencoded(URLENCODED));

app.use(cookieParser());

app.use(accessHeader);

app.get('/camunda/swagger.json', getAPIJson);

app.use('/camunda/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/camunda', router);

app.use(
  Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      // Capture all 404 and 500 errors
      if (error.status >= 400 && error.status <= 503) {
        return true;
      }
      return false;
    },
  })
);

module.exports = app;