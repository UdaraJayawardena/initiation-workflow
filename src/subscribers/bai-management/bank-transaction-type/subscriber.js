const { Variables } = require('camunda-external-task-client-js');

const Service = require('./service');

const { to, TE, mapTask, getErrorLog, getStringError, mapError, getToken } = require('@src/helper');

const {SUCCESS, RECORD_EXITS, IMPOSSIBLE} = require('./constants').codes;

const { Logger } = require('@src/modules/log');

const ACTION_TYPES = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
};

const processBankTransactionTypeSubscriber= async ({ task, taskService }) => {

  const variables = new Variables();
 
  const { bankTransactionTypes, bankTransactionByBankId } = task.variables.getAll();

  const errorLog = getErrorLog(task);

  const headerToken = getToken(task);

  const ERROR = 'Process Bank Transaction Type Failed';

  try {    

    if( !Object.values(ACTION_TYPES).includes(bankTransactionTypes.action) ) {
      const error = { error: 'Action parameter is not valide.' };
      Error.captureStackTrace(error);
      TE(error);
    }

    let responseData = null;
    let responseDataSet = null;

    const bankTransactionDataSet = {
      bank_id: bankTransactionTypes.bank_id,
      bank_transaction_type: bankTransactionTypes.bank_transaction_type,
      internal_transaction_type: bankTransactionTypes.internal_transaction_type,
      credit_sub_category_value: bankTransactionTypes.credit_sub_category_value,
      credit_detail_category_value: bankTransactionTypes.credit_detail_category_value,
      debet_sub_category_value: bankTransactionTypes.debet_sub_category_value,
      debet_detail_category_value: bankTransactionTypes.debet_detail_category_value
    };
    
    if( bankTransactionTypes.action === ACTION_TYPES.CREATE ) {

      const [error, TransactionsTypes] = await to(getBankTransactioNtypes(bankTransactionTypes.bank_id, headerToken));
      if(error) TE(error);
   
      const filterDataBTY =  TransactionsTypes.filter(btt => btt.bank_transaction_type == bankTransactionTypes.bank_transaction_type);
      
      if(filterDataBTY.length == 0 ){
        const [err, insertedBankTransactionType] = await to(createNewBankTransactionType(bankTransactionDataSet, headerToken));

        if (err) {
          const error = { error: err };
          Error.captureStackTrace(error);
          TE(error);
        }

        responseData = SUCCESS;
        responseDataSet = insertedBankTransactionType;
      }else{
        responseData = RECORD_EXITS;
        responseDataSet = filterDataBTY;
      }

    }

    if( bankTransactionTypes.action === ACTION_TYPES.UPDATE ) {

      const [err, updatedBankTransactionType] = await to(updateBankTransactionType(bankTransactionTypes.id, bankTransactionDataSet, headerToken));

      if (err) {
        const error = { error: err };
        Error.captureStackTrace(error);
        TE(error);
      }

      responseData = SUCCESS;
      responseDataSet = updatedBankTransactionType;
    }

    if( bankTransactionTypes.action === ACTION_TYPES.DELETE ) {
      
      const bankTransaction = bankTransactionByBankId.filter(bt => bt.bank_transaction_type == bankTransactionTypes.bank_transaction_type);

      if(bankTransaction.length == 0){
        const [err, deletedRecord] = await to(deleteExistingBankTransactionType(bankTransactionTypes.id, headerToken));

        if (err) {
          const error = { error: err };
          Error.captureStackTrace(error);
          TE(error);
        }

        responseData = SUCCESS;
        responseDataSet = deletedRecord;
      }else{
        responseData = IMPOSSIBLE;
        responseDataSet = bankTransaction;
      }

    }

    variables.set('bankTransactionTypeResponse', responseData);

    variables.set('bankTransactionTypeDataSet', responseDataSet);

    variables.set('result', responseData);

    variables.set('success', true);

    variables.set(task.executionId, {
      success: true
    });

    await taskService.complete(task, variables);

  } catch (error) {
   
    const errorStack = mapError(error, ERROR);

    Logger.error({
      module: 'BANK_TRANSACTION_TYPE',
      logData: {
        errorStack: errorStack,
        infoStack: mapTask(task)
      }
    });

    variables.set(task.executionId, {
      success: false,
      errorStack: errorStack
    });

    const strError = getStringError(errorStack.error);

    errorLog.push(strError);

    variables.set('errorLog', errorLog);
  
    variables.set('error', error);

    await taskService.handleBpmnError(
      task,
      'ERROR_PROCESS_BANK_TRANSACTION_TYPE',
      ERROR,
      variables
    );
  }
};

const getBankTransactioNtypes = async (bankId, requestToken) => {

  try {
      
    if( !bankId ) TE('Can\'t find bankid for get bank transaction type process');    
  
    const [err, bankTransTypes] = await to(Service.getBankTransactionTypeByBankId(bankId, requestToken));
  
    if( err ) TE(err);
  
    return bankTransTypes;
  
  } catch (error) {
    TE(error);
  }
  
};

const createNewBankTransactionType = async (bankTransactionType, requestToken) => {

  try {
    
    if( !bankTransactionType ) TE('Can\'t find data for create bank transaction type process');    

    const [err, insertedData] = await to(Service.createNewBankTransactionType(bankTransactionType, requestToken));

    if( err ) TE(err);

    return insertedData;

  } catch (error) {
    TE(error);
  }

};

const updateBankTransactionType = async (typeId, bankTransactionTypeData, requestToken) => {

  try {
    
    if( !typeId ) TE('Can\'t find id for update process');

    if( !bankTransactionTypeData ) TE('Can\'t find data for bank transaction type update process');    

    const requestData= {
      id: typeId,
      updateData: bankTransactionTypeData
    };
    const [err, updatedCategory] = await to(Service.updateBankTransactionType(requestData, requestToken));

    if( err ) TE(err);

    return updatedCategory;

  } catch (error) {
    TE(error);
  }

};

const deleteExistingBankTransactionType = async (typeId, requestToken) => {

  try {
    
    if( !typeId) TE('Can\'t find id for bank transaction type process');

    const [err, deleteData] = await to(Service.deleteExistingBankTransactionType(typeId, requestToken));

    if( err ) TE(err);

    return deleteData;

  } catch (error) {
    TE(error);
  }

};


module.exports = {
  processBankTransactionTypeSubscriber
};