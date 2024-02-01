const Deployment = require('./deployment');

module.exports = {

  subscribe: async (client) => {
    await Deployment.subscribe(client);
  }
};