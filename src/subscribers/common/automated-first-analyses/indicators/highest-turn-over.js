
const { Validators } = require('@src/utilities');

const checkHighestTurnOver = async (bankTransactionFileResult, platformParameter, token) => {

  const { smeLoanRequestBlocks } = bankTransactionFileResult;

  const turnOverIndicatorResult = {
    turnOverIndicator: '',
    highestSmeLoanRequestBlocks: [],
    turnOver: 0,
    turnOverOnYearlyBase: 0
  };

  const highestSmeLoanRequestBlocks = await Validators
    .validateHighestTurnoverIndicator(smeLoanRequestBlocks, token);

  turnOverIndicatorResult.highestSmeLoanRequestBlocks = highestSmeLoanRequestBlocks;

  for (let i = 0; i < highestSmeLoanRequestBlocks.length; i++) {
    const highestSmeLoanRequestBlock = highestSmeLoanRequestBlocks[i];
    const { turnOverOnYearlyBase, turnOver } = highestSmeLoanRequestBlock;
    turnOverIndicatorResult.turnOverOnYearlyBase = turnOverOnYearlyBase;
    turnOverIndicatorResult.turnOver = turnOver;
    if (turnOverOnYearlyBase >= platformParameter.minimalTurnOverAmount) {
      turnOverIndicatorResult.turnOverIndicator = 'green';
    } else if (turnOverOnYearlyBase >= (platformParameter.minimalTurnOverAmount * 1 / 2)) {
      turnOverIndicatorResult.turnOverIndicator = 'orange';
    } else {
      turnOverIndicatorResult.turnOverIndicator = 'red';
    }
  }

  return turnOverIndicatorResult;
};

module.exports = { checkHighestTurnOver };