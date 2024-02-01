const {
  processMT940,
  processPSD2,
  parsDailyPSD2Transactions
} = require('./subscriber');

module.exports = {

  subscribe: async (client) => {

    await client.subscribe('process-mt-940', processMT940);

    await client.subscribe('process-psd2', processPSD2);

    await client.subscribe('pars-daily-PSD2-transactions', parsDailyPSD2Transactions);
  }
};