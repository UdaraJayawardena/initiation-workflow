/* eslint-disable no-unused-vars */
const { Variables } = require('camunda-external-task-client-js');

const { InitiationManagementService, BaiManagementService, LoanManagement, AuthenticationService, CrmManagementService } = require('@src/services');

const { getToken, mapTask, getStringError, getErrorLog, mapError, TE, to } = require('@src/helper');

const { APPLICATION, PSD2_DAILY_UPDATE_TO_EMAIL } = require('@config').Config;

const MODULE = 'DAILY_UPDATE_PSD2_DATA';

const { Logger } = require('@src/modules/log');

const _handleError = (task, variables, errorLog, error, ERROR) => {

  const errorStack = mapError(error, ERROR);

  Logger.error({
    module: MODULE,
    logData: {
      errorStack: errorStack,
      infoStack: mapTask(task)
    }
  });

  variables.set(task.executionId, { success: false, errorStack: errorStack });

  const strError = getStringError(errorStack.error);

  errorLog.push(strError);

  variables.set('errorLog', errorLog);

  variables.set('error', error);

  return variables;
};


const firstSubscriber = async ({ task, taskService }) => {

  let variables = new Variables();

  const errorLog = getErrorLog(task);

  const ERROR = '';

  try {


    await taskService.complete(task, variables);

  } catch (error) {

    variables = _handleError(task, variables, errorLog, error, ERROR);

    const errorCode = '';

    await taskService.handleBpmnError(task, errorCode, ERROR, variables);
  }
};


const selectPSD2Account = async ({ task, taskService }) => {

  let variables = new Variables();

  const errorLog = getErrorLog(task);

  const ERROR = 'Unexpected Error Occurred while getting inverse consent Collection';

  try {

    const { inputCustomerId} = task.variables.getAll();

    const params = {consent_collection_status : 'active', consent_status : 'active,in-active'};

    if(inputCustomerId) params.customerId = inputCustomerId;

    const consentCollection = await BaiManagementService.InverseConsent.getConsentCollectionByStatus(params);

    const consentsList = consentCollection.data.map(consent => {

      return {      
        consentCollectionId: consent.consent_collection_id,
        ibanNumber: consent.iban_number,
        status: consent.status,
        customerId: consent.consentCollection.customer_id,
        dbConsentId : consent.id,
        consentValidFromDate : consent.consent_valid_from_date
      };      
    });    

    variables.set('consents', consentsList);

    await taskService.complete(task, variables);

  } catch (error) {

    variables = _handleError(task, variables, errorLog, error, ERROR);

    const errorCode = 'ERROR_GET_INVERSE_CONSENTS';

    await taskService.handleBpmnError(task, errorCode, ERROR, variables);
  }
};


const checkRelatedFlexloanOrLoanRequest = async ({ task, taskService }) => {

  let variables = new Variables();

  const errorLog = getErrorLog(task);

  const ERROR = 'Unexpected Error Occurred while check consent is related to an active Flex-loan or loan-request';

  const { customerId } = task.variables.getAll();

  const loanParams = {
    smeId : customerId,
    type : 'flex-loan',
    status : ['outstanding', 'in-revision']
  };

  const loanRequestParams = { 
    customerId: customerId,
    status: [ 'request-rejected-by-us', 'request-rejected-by-customer', 'sme-loan-created-within-loan-management', 'received-from-customer']
  };

  try {

    //Step 1: Check if active Flex-loan with this customer
    const smeLoan = await LoanManagement.selectFlexTypeSmeLoans.selectFlexTypeSmeLoans(loanParams);

    if(smeLoan.length) { 
      variables.set('activeFlex', 'Yes');
      variables.set('flexLoan', smeLoan[0].contractId);
    } else {
     
      variables.set('activeFlex', 'No');
    }

    //Step 2: Check if active loan-request with this customer
    const smeLoanRequest = await InitiationManagementService.SmeLoanRequestService.getSmeLoanRequestByCustomerId(loanRequestParams);

    if(smeLoanRequest.length) { 
      variables.set('activeRequest', 'Yes');
      variables.set('loanRequestId', smeLoanRequest[0].loanRequestId);
    } else {
     
      variables.set('activeRequest', 'No');
    }

    await taskService.complete(task, variables);

  } catch (error) {

    variables = _handleError(task, variables, errorLog, error, ERROR);

    const errorCode = 'ERROR_GET_FLEX_LOAN_OR_LOAN_REQUEST';

    await taskService.handleBpmnError(task, errorCode, ERROR, variables);
  }
};


const updateConsentStatus = async ({ task, taskService }) => {

  let variables = new Variables();

  const errorLog = getErrorLog(task);

  const ERROR = 'Unexpected Error Occurred while update Consent Status';

  const { ibanNumber, customerId, consentStatus, dbConsentId, activeFlex, activeRequest, consentCollectionId, flexLoan, loanRequestId } = task.variables.getAll();

  try {

    let emailData = null;
    let customerName = '';

    // //Step 3: Process consent status 
    // if(activeFlex === 'No' && activeRequest === 'No') {
        
    //   //update consent collection status
    //   await BaiManagementService.InverseConsentCollection.updateConsentCollection({
    //     invers_consent_collection_id: consentCollectionId,
    //     status: 'inactive',
    //     action: 'update'
    //   }); 
    //   //update consent status
    //   await BaiManagementService.InverseConsent.updateConsent({
    //     'id' : dbConsentId,
    //     'iban_number': ibanNumber,
    //     'status': 'in-active'     // in confluence it says inactive (not in-active), but we use like this to not to break system  
    //   });

    //   await taskService.complete(task, variables);
    // }
 
    switch(consentStatus) {

      //Step 4: Process status ‘expired’
      case 'expired': {

        //update consent status
        await BaiManagementService.InverseConsent.updateConsent({
          'id' : dbConsentId,
          'iban_number': ibanNumber,
          'status': consentStatus
        });
        //TODO
        // <start the consent renewal process>

        // // update consent collection status
        // await BaiManagementService.InverseConsentCollection.updateConsentCollection({
        //   invers_consent_collection_id: consentCollectionId,
        //   status: 'inactive',
        //   action: 'update'
        // }); 

        const [err, result] = await to(CrmManagementService.GetCustomer.getCustomerForPsd2Data({id : customerId}));
          
        if (result) {
          customerName = result.legalName;
        }

        emailData = {
          to: PSD2_DAILY_UPDATE_TO_EMAIL,
          text: '',
          type: 'psd2-update-notification',
          priority: 5,       
          cluster: 'loan-management',
          metaData: {
            templateType: 'PSD2_UPDATE_NOTIFICATION_01',
            customerId: customerId,
            ibanNumber: ibanNumber,
            customerName: customerName?customerName: '',
            flexLoan: flexLoan? flexLoan: '',
            loanRequestId: loanRequestId? loanRequestId: ''
          }
        };

        break;
      }


      //Step 5: Process status ‘revoked’
      case 'revoked': {
        
        //update the status of the consent in the consents table
        await BaiManagementService.InverseConsent.updateConsent({
          'id' : dbConsentId,
          'iban_number': ibanNumber,
          'status': consentStatus
        });

        // // update consent collection status
        // await BaiManagementService.InverseConsentCollection.updateConsentCollection({
        //   invers_consent_collection_id: consentCollectionId,
        //   status: 'inactive',
        //   action: 'update'
        // }); 

        const [err, result] = await to(CrmManagementService.GetCustomer.getCustomerForPsd2Data({id : customerId}));          
        if (result) {
          customerName = result.legalName;
        }
        const csmList = await AuthenticationService.GetUsers.getUserList({roleName: 'CSM'});
        const csmEmailList = csmList.map(csm => csm.email );

        emailData = {
          to: PSD2_DAILY_UPDATE_TO_EMAIL,
          // cc: csmEmailList,
          text: '',
          type: 'psd2-update-notification',
          priority: 5,       
          cluster: 'loan-management',
          metaData: {
            templateType: 'PSD2_UPDATE_NOTIFICATION_02',
            customerId: customerId,
            ibanNumber: ibanNumber,
            customerName: customerName?customerName: '',
            flexLoan: flexLoan? flexLoan: '',
            loanRequestId: loanRequestId? loanRequestId: ''
          }
        };

        break;
      }

      //Step 6: Process status ‘rejected’ and ‘terminated’
      case 'rejected' :
      case 'terminated' : {

        await BaiManagementService.InverseConsent.updateConsent({
          'id' : dbConsentId,
          'iban_number': ibanNumber,
          'status': 'expired'
        });

        // const csmList = await AuthenticationService.GetUsers.getUserList({roleName: 'CSM'});
        // const csmEmailList = csmList.map(csm => csm.email );
        // const itDeveloperList = await AuthenticationService.GetUsers.getUserList({roleName: 'IT developer'});
        // const itDeveloperEmailList = itDeveloperList.map(csm => csm.email );

        const [err, result] = await to(CrmManagementService.GetCustomer.getCustomerForPsd2Data({id : customerId}));          
        if (result) {
          customerName = result.legalName;
        }
        emailData = {
          to: PSD2_DAILY_UPDATE_TO_EMAIL,
          text: '',
          type: 'psd2-update-notification', 
          priority: 5,       
          cluster: 'loan-management',       
          metaData: {
            templateType: 'PSD2_UPDATE_NOTIFICATION_03',
            customerId: customerId,
            ibanNumber: ibanNumber,
            customerName: customerName?customerName: '',
            flexLoan: flexLoan? flexLoan: '',
            loanRequestId: loanRequestId? loanRequestId: ''
          }
        };

        break;
      }
     
    }

    variables.set('emailData', emailData );
    await taskService.complete(task, variables);

  } catch (error) {

    variables = _handleError(task, variables, errorLog, error, ERROR);

    const errorCode = 'ERROR_UPDATE_CONSENT_STATUS';

    await taskService.handleBpmnError(task, errorCode, ERROR, variables);
  }
};


const parsDailyPSD2Transactions = async ({ task, taskService }) => {

  let variables = new Variables();

  const errorLog = getErrorLog(task);

  const ERROR = 'Unexpected Error Occurred while pars Daily PSD2 Bank Transactions';

  const { psd2DataUrl, ibanNumber, dateFrom } = task.variables.getAll();

  try {

    const transactionData = {
      fileUrl : psd2DataUrl, 
      ibanNumber : ibanNumber, 
      dateForm : dateFrom
    };

    const parserResults = BaiManagementService.PassPSD2.passPSD2BankTransaction(transactionData);

    if(parserResults){
      variables.set('parserResults', parserResults );
    }

    await taskService.complete(task, variables);

  } catch (error) {

    variables = _handleError(task, variables, errorLog, error, ERROR);

    const errorCode = 'ERROR_PARS_DAILY_PSD2';

    await taskService.handleBpmnError(task, errorCode, ERROR, variables);
  }
};

const updatePSD2BankTransactions = async ({ task, taskService }) => {

  let variables = new Variables();

  const errorLog = getErrorLog(task);

  const { consentCollectionId, ibanNumber, consentStatus,  consentValidFromDate} = task.variables.getAll();

  const ERROR = 'Unexpected error occurred while update PSD2 bank transactions failed';

  try {
    let consentStatusTemp = consentStatus;
    let psd2DateUrl = null;
    let isConsentValid = false;
    let runForPSD2DailyUpdate = false;
    const token = getToken(task);

    const consentInformation = await BaiManagementService.InversPSD2.getInversConsentInformation({
      type: 'regular',
      collection_id: consentCollectionId,
      from_date: ''
    }, token);

    const ibanMapAccount =  consentInformation.accounts.find(a=>a.iban == ibanNumber);
    let getDataFrom = '';

    if(ibanMapAccount){
      // ibanMapAccount.status == 1 added due to a wrong status received form inverse service. need to remove it back when the issue is fixed
      if(ibanMapAccount.status == 1){
        
        // consent valid
        // need to get PSD2 Data
        getDataFrom = (ibanMapAccount.lastdownload)?ibanMapAccount.lastdownload: consentValidFromDate;
        const PSD2Transactions = await BaiManagementService.InversPSD2.getPSD2Transactions({ 
          consent_collection_id: consentCollectionId,
          bank_accounts: [{iban:ibanMapAccount.iban,from_date:getDataFrom}]
        }, token);
        
        // now need to upload PSD2 transactions and get upload URL

        if(PSD2Transactions){
          // PSD2 transactions availble
          const savedPSDFIle = await BaiManagementService.InversPSD2.storePSD2Data({consentCollectionId:consentCollectionId, data:PSD2Transactions}, token);
          psd2DateUrl = savedPSDFIle.fileUrl;
          isConsentValid = true;
          runForPSD2DailyUpdate = true;

        }

      }else if(ibanMapAccount.status == 3){
        // revoked
        consentStatusTemp = 'revoked';
      }else if(ibanMapAccount.status == 2){
        // expired
        consentStatusTemp = 'expired';
      }
      // else if(ibanMapAccount.status == 1){
      //   // terminated
      //   consentStatusTemp = 'terminated';
      // }
      // else if(ibanMapAccount.status == 5){
      //   // terminated
      //   consentStatusTemp = 'terminated';
      // }
    }


    variables.set('dateFrom', getDataFrom);
    variables.set('psd2DataUrl', psd2DateUrl);
    variables.set('consentStatus', consentStatusTemp);
    variables.set('isConsentValid', isConsentValid);
    variables.set('runForPSD2DailyUpdate', runForPSD2DailyUpdate);
    

    variables.set(task.executionId, {
      success: true
    });

    await taskService.complete(task, variables);

  } catch (error) {

    variables = _handleError(task, variables, errorLog, error, ERROR);

    const errorCode = 'ERROR_UPDATE_PSD2_BANK_TRANSACTIONS';

    await taskService.handleBpmnError(task, errorCode, ERROR, variables);
  }
};


const validateCustomerId = async ({ task, taskService }) => {

  let variables = new Variables();

  const errorLog = getErrorLog(task);

  const ERROR = 'Unexpected Error Occurred while validating customerId';

  try {
    const { inputCustomerId} = task.variables.getAll();
    
    if(!inputCustomerId) TE({ code: 400, message: 'CustomerId required.' });

    variables.set('inputCustomerId', inputCustomerId);

    await taskService.complete(task, variables);

  } catch (error) {

    variables = _handleError(task, variables, errorLog, error, ERROR);

    const errorCode = 'ERROR_VALIDATE_CUSTOMER_ID';

    await taskService.handleBpmnError(task, errorCode, ERROR, variables);
  }
};

module.exports = {

  firstSubscriber,

  selectPSD2Account,

  updatePSD2BankTransactions,

  checkRelatedFlexloanOrLoanRequest,

  updateConsentStatus,

  validateCustomerId
};

