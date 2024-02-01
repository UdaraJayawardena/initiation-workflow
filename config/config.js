const dotEnv = require('dotenv');

const chalk = require('chalk');

const pJson = require('../package.json');

const termination = chalk.bold.magenta;

dotEnv.config();

const terminateServer = (reason) => {

  console.log(termination(`Application terminate due to ${reason}`));

  process.exit(0);
};

const ENV_CONFIGURATION = () => {

  try {

    const path = `${APPLICATION.ENV_FILE_PATH}/${APPLICATION.ENV}.json`;

    return require(path);

  } catch (err) {

    console.log(err);

    console.log(`\n********** ENVIRONMENT NOT FOUND **********
      \nPlease follow below step
      \n01. Create development.json, production,json and test.json in /config/env/ 
      \n02. Copy sample content below created all files.
      \n03. Change content
      \n\nNote:- Do you want to run/build development environment, only create development.json\n`);

    terminateServer('mismatch environment\n');
  }
};

const getConfig = (configName) => {

  const envConfig = ENV_CONFIGURATION();

  if (!envConfig) terminateServer('env file not found');

  if (!envConfig[configName]) terminateServer(`${configName} not config`);

  return envConfig[configName];
};

const API_VERSIONS = process.env.API_VERSIONS.split(' ');

const getDBObject = () => {
  const dbObject = {
    DB_URI: process.env.DB_URI
  };

  API_VERSIONS.map(k => {
    const dbKey = `DB_NAME_${k}`;
    const dbValue = process.env[dbKey];
    dbObject[dbKey] = IS_TEST ? `test_${dbValue}` : dbValue;
  });

  return dbObject;
};

const IS_TEST = process.env.NODE_ENV === 'test';

const IS_DEV = process.env.NODE_ENV === 'development'
  && (process.env.APP_ENV === 'development' || process.env.APP_ENV === 'localhost');

const IS_STAGE = process.env.NODE_ENV === 'development'
  && process.env.APP_ENV === 'stage';

const IS_PROD = process.env.NODE_ENV === 'production';

const APPLICATION = {

  VERSION: process.env.VERSION,
  ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  HOST: process.env.HOST,

  APP_NAME: process.env.APP_NAME,
  APP_HOST: process.env.HOST,
  APP_KEY: process.env.APP_KEY,
  APP_CLUSTER: process.env.APP_CLUSTER,
  APP_ENV: process.env.APP_KEY,
  APP_URL: process.env.APP_URL,

  INTEGRATION: process.env.INTEGRATION,
  ENV_FILE_PATH: process.env.ENV_FILE_PATH,
  CAMUNDA_GRANT_NAME: process.env.CAMUNDA_GRANT_NAME,

  IS_TEST: IS_TEST,

  IS_DEV: IS_DEV,

  IS_STAGE: IS_STAGE,

  IS_PROD: IS_PROD,

  IS_NOT_PROD: !IS_PROD,

  REDIS_PORT: process.env.REDIS_PORT,
  REDIS_HOST: process.env.REDIS_HOST,

  ...getDBObject()
};

const SWAGGER = {
  DEFINITION: {
    swagger: '2.0',
    // openapi: '3.0.0',
    info: {
      title: 'Initiation Camunda workflow API',
      version: pJson.version,
      description: 'Endpoints to test the loan initiation camunda-workflow routes'
    },
    host: APPLICATION.APP_URL,
    basePath: '/camunda',
    securityDefinitions: {
      bearerAuth: {
        type: 'apiKey',
        name: 'authorization',
        in: 'header',
      },
    },
    security: [{ bearerAuth: [] }],
  },

  APIS: []
};

const BODYPARSER = {

  JSON_PARSER: getConfig('JSON_PARSER'),

  URLENCODED: getConfig('URLENCODED')
};

const ACCESS_HEADERS = {

  ALLOWED_DOMAINS: getConfig('ALLOWED_DOMAINS'),

  ALLOW_METHODS: getConfig('ALLOW_METHODS'),

  ALLOW_HEADERS: getConfig('ALLOW_HEADERS')
};

const SYSTEM = {
  ...getConfig('system')
};

const CAMUNDA = {
  ...getConfig('camunda')
};

const INITIATION_MANAGEMENT = {
  ...getConfig('initiation-management')
};

const CONFIGURATIONS = {
  ...getConfig('configurations')
};

const CRM_GATEWAY = {
  ...getConfig('crm-gateway')
};

const CRM_MANAGEMENT = {
  ...getConfig('crm-management')
};

const BAI_MANAGEMENT = {
  ...getConfig('bai-management')
};

const BAI_PARSER = {
  ...getConfig('bai-parser')
};

const V_TIGER = {
  ...getConfig('v-tiger')
};

const AUTHENTICATION = {
  ...getConfig('authentication')
};

const CAMUNDA_CLIENT = {
  ...getConfig('camunda-client')
};

const LOAN_MANAGEMENT = {
  ...getConfig('loan-management')
};

const NOTIFICATIONS = {
  ...getConfig('notifications')
};

const PSD2_PARSER = {
  ...getConfig('psd2-daily-update-parser')
};

const AUTOMATED_ANALYSIS = {
  ...getConfig('automatedAnalysis')
};

const PSD2_DAILY_UPDATE_TO_EMAIL = getConfig('psd2-daily-update-notification-to-email');

const AWS_CONFIGS = {
  ...getConfig('aws')
};

const INITIATION_API_GATEWAY = {
  ...getConfig('initiationApiGateway')
};

const REVISION_V_TIGER_CALL = {
  ...getConfig('revision-vTiger-call')
};



module.exports = {

  APPLICATION,

  SWAGGER,

  BODYPARSER,

  ACCESS_HEADERS,

  SYSTEM,

  CAMUNDA,

  INITIATION_MANAGEMENT,

  CONFIGURATIONS,
  
  CRM_GATEWAY,

  CRM_MANAGEMENT,

  BAI_MANAGEMENT,

  BAI_PARSER,

  V_TIGER,

  AUTHENTICATION,

  INITIATION_API_GATEWAY,

  CAMUNDA_CLIENT,

  LOAN_MANAGEMENT,

  NOTIFICATIONS,

  PSD2_PARSER,

  AUTOMATED_ANALYSIS,

  PSD2_DAILY_UPDATE_TO_EMAIL,

  SENTRY_DSN: process.env.SENTRY_DSN,

  SENTRY_ENVIRONMENT: process.env.SENTRY_ENVIRONMENT,

  SENTRY_SAMPLERATE: process.env.SENTRY_SAMPLERATE,

  AWS_CONFIGS,
  
  REVISION_V_TIGER_CALL
};
