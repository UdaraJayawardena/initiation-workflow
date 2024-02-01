const {
  updatePlatformParameter
} = require('./subscriber');
    
module.exports = {
    
  subscribe: async (client) => {
    
    await client.subscribe('update-platform-parameter', updatePlatformParameter);
  }
};