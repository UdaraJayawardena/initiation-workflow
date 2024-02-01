const AutomatedFirstAnalyses = require('./automated-first-analyses');

const Vtiger = require('./v-tiger');

const BAIParser = require('./bai-parser');

const DetermineCreditRiskParameter = require('./determine-credit-risk-parameter');

const LoanInitiation = require('./loan-initiation');

const DailyUpdatePSD2Data = require('./daily-update-psd2-data');

const ErrorHandlingAndCreateJiraTicket = require('./create-jira-ticket');

module.exports = {
  subscribe: async (client) => {
    await AutomatedFirstAnalyses.subscribe(client);

    await Vtiger.subscribe(client);

    await BAIParser.subscribe(client);

    await DetermineCreditRiskParameter.subscribe(client);

    await LoanInitiation.subscribe(client);

    await DailyUpdatePSD2Data.subscribe(client);

    await ErrorHandlingAndCreateJiraTicket.subscribe(client);
  },
};