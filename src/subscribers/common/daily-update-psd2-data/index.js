const {
  firstSubscriber,

  selectPSD2Account,

  updatePSD2BankTransactions,

  checkRelatedFlexloanOrLoanRequest,

  updateConsentStatus,

  validateCustomerId

} = require('./subscriber');

module.exports = {

  subscribe: async (client) => {

    await client.subscribe('first-subscriber', firstSubscriber);

    await client.subscribe('select-psd2-account', selectPSD2Account);

    await client.subscribe('update-psd2-bank-transactions', updatePSD2BankTransactions);

    await client.subscribe('check-flex-loans_or_loan_requests', checkRelatedFlexloanOrLoanRequest);

    await client.subscribe('update-consent-status', updateConsentStatus);

    await client.subscribe('validate-customer-id', validateCustomerId);

  }
};