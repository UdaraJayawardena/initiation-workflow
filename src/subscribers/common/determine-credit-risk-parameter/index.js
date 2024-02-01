const {
  determineHighestTurnoverBankAccount,
  createCreditRiskParameters
} = require('./subscriber');

module.exports = {

  subscribe: async (client) => {

    await client.subscribe('determine-highest-turn-over-bank-account', determineHighestTurnoverBankAccount);

    await client.subscribe('create-risk-parameters', createCreditRiskParameters);
  }
};