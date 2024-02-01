const Deployment = require('./engine-rest/deployment');
const historyProcessInstance = require('./history-process-instance');


module.exports = {
  historyProcessInstance: historyProcessInstance,
  EngineRestService: {
    Deployment: Deployment
  }
};