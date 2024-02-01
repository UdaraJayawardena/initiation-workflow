const moment = require('moment');

const { BaiManagementService, ConfigurationsService } = require('@src/services');

const { SmeLoanRequestTransactionBlockService } = BaiManagementService;

const { HolidaysService } = ConfigurationsService;

const _getUniqueArray = (array, key) => {

  const uniqueArray = [];

  array.forEach(ele => {
    const index = uniqueArray.findIndex(uniqueEle => 
      uniqueEle[key] === ele[key]);

    if(index === -1) uniqueArray.push(ele);
  });

  return uniqueArray;
};

const checkBankTransactionFiles = async (contractId, platformParameter, token) => {

  const bankTransactionFiles = {
    bankFileIndicator1: '',
    bankFileIndicator2: '',
    bankFileIndicator3: '',
    numberOfBankAccounts: 0,
    numberOfDays: 0,
    smeLoanRequestBlocks: []
  };

  const smeLoanRequestBlocks = await SmeLoanRequestTransactionBlockService
    .getSmeLoanRequestBlocks({
      action: 'get',
      sme_loan_request_id: contractId
    }, token);

  bankTransactionFiles.smeLoanRequestBlocks = smeLoanRequestBlocks;

  const uniqueRequestBlocks = _getUniqueArray(smeLoanRequestBlocks, 'iban_number');

  const numberOfBankAccounts = uniqueRequestBlocks.length;

  bankTransactionFiles.numberOfBankAccounts = numberOfBankAccounts;

  if (numberOfBankAccounts <= 0 || numberOfBankAccounts > 1) {
    bankTransactionFiles.bankFileIndicator1 = 'orange';
    return bankTransactionFiles;
  }

  const uniqueRequestBlock = uniqueRequestBlocks[0];
  bankTransactionFiles.bankFileIndicator1 = 'green';

  const { start_date, end_date } = uniqueRequestBlock;

  const numberOfDays = moment(end_date).diff(start_date, 'days');
  bankTransactionFiles.numberOfDays = numberOfDays;
  
  const currentDate = moment().format('YYYY-MM-DD');
  const maxNumberOfDate = await HolidaysService
    .getThePreviousWorkingDay(currentDate, platformParameter.maxNumberOfWorkingDaysBankFile);

  if (moment(end_date).isBefore(maxNumberOfDate)) {
    bankTransactionFiles.bankFileIndicator2 = 'red';
    return bankTransactionFiles;
  }

  bankTransactionFiles.bankFileIndicator2 = 'green';

  if (numberOfDays >= platformParameter.minimalNumberOfDaysInBankFile) {
    bankTransactionFiles.bankFileIndicator3 = 'green';
  } else if (numberOfDays >= (platformParameter.minimalNumberOfDaysInBankFile * 1 / 2)) {
    bankTransactionFiles.bankFileIndicator3 = 'orange';
  } else {
    bankTransactionFiles.bankFileIndicator3 = 'red';
  }

  return bankTransactionFiles;
};

module.exports = { checkBankTransactionFiles };