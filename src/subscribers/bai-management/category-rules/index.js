const {
  processCategoryRuleSubscriber
} = require('./subscriber');

module.exports = {

  subscribe: async (client) => {

    await client.subscribe('process-category-rules', processCategoryRuleSubscriber);

  }
};