const { Config } = require('@config');

const getBaseUrl = (configName) => Config[configName].baseUrl;

module.exports = {
  getBaseUrl
};