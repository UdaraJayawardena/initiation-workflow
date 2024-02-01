const {
  subscriberGetPlatformParameters
} = require('./subscriber');

module.exports = {

  subscribe: async (client) => {
    await client.subscribe('get-platform-parameters', subscriberGetPlatformParameters);
  }
};