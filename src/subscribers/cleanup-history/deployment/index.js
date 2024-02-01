const {
  cleanUpDeploymentHistory
} = require('./subscriber');

module.exports = {

  subscribe: async (client) => {
    await client.subscribe('CleanUpDeploymentHistory', cleanUpDeploymentHistory);
  }
};