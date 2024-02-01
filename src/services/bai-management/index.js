const BankAccountDailyPosition = require('./bank-account-daily-position');
const BankTransaction = require('./bank-transaction');
const SmeLoanRequestTransactionBlock = require('./sme-loan-request-transaction-block');
const InverseConsent = require('./inverse-consent');
const InversPSD2 = require('./invers-PSD2');
const InverseConsentCollection = require('./inverse-consent-collection');

module.exports = {
  BankAccountDailyPosition: BankAccountDailyPosition,
  BankTransactionService: BankTransaction,
  SmeLoanRequestTransactionBlockService: SmeLoanRequestTransactionBlock,
  InverseConsent: InverseConsent,
  InversPSD2: InversPSD2,
  InverseConsentCollection: InverseConsentCollection
};