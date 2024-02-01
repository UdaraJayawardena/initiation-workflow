const {
  checkAlreadyActiveRevision,
  updateVTigerAfterFirstAnalyses,
  automatedFirstAnalysis
} = require('./subscriber');

module.exports = {

  subscribe: async (client) => {

    await client.subscribe('check-already-active-revision', checkAlreadyActiveRevision);

    await client.subscribe('update-v-tiger-after-first-analyses', updateVTigerAfterFirstAnalyses);

    await client.subscribe('automated-first-analysis', automatedFirstAnalysis);
  }
};