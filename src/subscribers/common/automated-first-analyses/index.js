const {
  makeFirstAnalysesIndicators,
} = require('./subscriber');

module.exports = {

  subscribe: async (client) => {

    await client.subscribe('make-first-analyses-indicators', makeFirstAnalysesIndicators);
  }
};