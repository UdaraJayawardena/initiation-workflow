const { publishErrorForCreatingJiraTicket } = require('./subscriber');

module.exports = {
  subscribe: async (client) => {
    await client.subscribe(
      'publish-error-for-creating-jira-ticket',
      publishErrorForCreatingJiraTicket
    );
  },
};
