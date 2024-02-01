const Config = require('./config');

const Contract = require('./contract');

const ContractParty = require('./contract-party');

const SmeLoanRequest = require('./sme-loan-request');

const DebtAtThirdParty = require('./debt-at-third-party');

const SmeLoanRequestProposal = require('./sme-loan-request-proposal');

const SmeLoanRequestAlarm = require('./sme-loan-request-alarm');

const DebtorCreditor = require('./debtor-creditor');

module.exports = {

  subscribe: async (client) => {

    await Config.subscribe(client);

    await Contract.subscribe(client);

    await ContractParty.subscribe(client);

    await DebtorCreditor.subscribe(client);

    await SmeLoanRequest.subscribe(client);

    await DebtAtThirdParty.subscribe(client);

    await SmeLoanRequestProposal.subscribe(client);

    await SmeLoanRequestAlarm.subscribe(client);
  }
};