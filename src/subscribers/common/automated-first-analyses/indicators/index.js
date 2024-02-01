const { checkBankTransactionFiles } = require('./bank-files');
const { checkExpectedDDAmount } = require('./expected-dd-amount');
const { checkHighRiskRegister } = require('./high-risk-register');
const { checkHighestTurnOver } = require('./highest-turn-over');
const { checkLegalForm } = require('./legal-form');

module.exports = {
  checkBankTransactionFiles,
  checkExpectedDDAmount,
  checkHighRiskRegister,
  checkHighestTurnOver,
  checkLegalForm
};
