const {

  sendNotifications
  
} = require('./subscriber');

module.exports = {

  subscribe: async (client) => {

    await client.subscribe('send-notification', sendNotifications);

  }
};
