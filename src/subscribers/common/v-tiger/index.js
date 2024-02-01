const {
  getAllInfoOutOfVTiger,
  revisionCallToVtiger,
} = require('./subscriber');

module.exports = {

  subscribe: async (client) => {

    await client.subscribe('get-all-info-out-of-v-tiger', getAllInfoOutOfVTiger);
    await client.subscribe('vTiger-revision-call', revisionCallToVtiger);
  }
};