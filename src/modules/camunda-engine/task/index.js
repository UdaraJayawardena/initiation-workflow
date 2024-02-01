const service = require('./service');

const controller = require('./controller');

const routes = require('./routes');

module.exports = {

  TaskService: service,

  TaskController: controller,

  TaskRoutes: routes,
};
