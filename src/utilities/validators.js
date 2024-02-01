// Import third party module
const moment = require('moment');

const { BaiManagementService } = require('@src/services');

const { BankTransactionService, SmeLoanRequestTransactionBlockService } = BaiManagementService;

const { arrayFilterByKey, arrayTotalByKey } = require('./filters');

const validateHighestTurnoverIndicator =  async (smeLoanRequestBlocks, token) => {

  if(!smeLoanRequestBlocks) return [];

  for (let i = 0; i < smeLoanRequestBlocks.length; i++) {

    const smeLoanRequestBlock = smeLoanRequestBlocks[i];

    const { iban_number, start_date, end_date } = smeLoanRequestBlock;

    const bankTransactions = await BankTransactionService.getBankTransactions({
      action: 'GET',
      iban_number: iban_number,
      start_date: start_date,
      end_date: end_date
    }, token);

    const revenueBts = arrayFilterByKey(bankTransactions, 'sub_category','REVENUE');

    const turnOver = arrayTotalByKey(revenueBts);

    const numberOfDays = moment(end_date).diff(start_date, 'days');

    const newTurnOverOnYearlyBase = (365 / numberOfDays) * turnOver;

    smeLoanRequestBlock.turnOver = turnOver;
    smeLoanRequestBlock.turnOverOnYearlyBase = newTurnOverOnYearlyBase;
    smeLoanRequestBlocks[i] = smeLoanRequestBlock;
  }

  smeLoanRequestBlocks = smeLoanRequestBlocks
    .sort((block1, block2) => block2.turnOverOnYearlyBase - block1.turnOverOnYearlyBase)
    .map(block => {
      block.highest_turnover_indicator = false;
      if (smeLoanRequestBlocks[0].turnOverOnYearlyBase === block.turnOverOnYearlyBase) {
        block.highest_turnover_indicator = true;
      }
      return block;
    });

  //Update turnOverOnYearly
  for (let i = 0; i < smeLoanRequestBlocks.length; i++) {
    const smeLoanRequestBlock = smeLoanRequestBlocks[i];
    const { id, highest_turnover_indicator } = smeLoanRequestBlock;
    await SmeLoanRequestTransactionBlockService
      .updateSmeLoanRequestBlocks(id, { highest_turnover_indicator }, token);
  }

  const highestSmeLoanRequestBlocks = smeLoanRequestBlocks.filter(
    block => block.highest_turnover_indicator);

  return highestSmeLoanRequestBlocks;
};

module.exports = {
  validateHighestTurnoverIndicator
};