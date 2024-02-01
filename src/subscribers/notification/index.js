const Email = require('./email');

module.exports = {

  subscribe: async (client) => {

    await Email.subscribe(client);
  }
};