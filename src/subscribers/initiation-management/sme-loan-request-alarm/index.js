const {
  addSmeLoanRequestAlarm
} = require('./subscriber');

module.exports = {

  subscribe: async (client) => {

    await client.subscribe('add-multiple-sme-loan-request-alarm', addSmeLoanRequestAlarm);
  }
};