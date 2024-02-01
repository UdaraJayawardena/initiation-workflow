const service = require('./service');

const controller = require('./controller');

const routes = require('./routes');

module.exports = {

  ProcessDefinitionService: service,

  ProcessDefinitionController: controller,

  ProcessDefinitionRoutes: routes,
};
