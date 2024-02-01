const BankTransaction = require('./bank-transaction');

const CategoryRules = require('./category-rules');

const BankTransactionType = require('./bank-transaction-type');

const BankAccount = require('./bank-account');

module.exports = {

  subscribe: async (client) => {

    await BankTransaction.subscribe(client);

    await CategoryRules.subscribe(client);

    await BankTransactionType.subscribe(client);

    await BankAccount.subscribe(client);
  }
};