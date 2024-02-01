const { Variables } = require('camunda-external-task-client-js');

const moment = require('moment');

const Service = require('./service');

const { to, TE, mapTask, mapError, getErrorLog } = require('@src/helper');

const { Logger } = require('@src/modules/log');

const getHolidayByDate = async ({ task, taskService }) => {

  const variables = new Variables();

  try {

    const date = task.variables.get('date');

    const [err, holidayObj] = await to(Service.getHolidayByDate(date));

    if (err) TE(err);

    const { isHoliday } = holidayObj;

    variables.set('isHoliday', isHoliday);

    variables.set('result', holidayObj);

    variables.set('success', true);

    await taskService.complete(task, variables);

  } catch (error) {

    variables.set('error', error);

    variables.set('success', false);

    await taskService.handleBpmnError(
      task,
      'ERROR_GET_HOLIDAY_BY_DATE',
      'Unexpected Error Occurred while getting holiday by date',
      variables
    );
  }
};

const subscribeGetTheNextWorkingDay = async ({ task, taskService }) => {

  const variables = new Variables();

  try {

    const startDate = task.variables.get('startDate');

    const noOfDaysAhead = task.variables.get('noOfDaysAhead');

    const [err, result] = await to(Service
      .getTheNextWorkingDay(startDate, noOfDaysAhead));

    if (err) TE(err);

    variables.set('nextWorkingDay', result);

    variables.set('result', result);

    variables.set('success', true);

    await taskService.complete(task, variables);

  } catch (error) {

    variables.set('error', error);
    variables.set('success', false);
  }
};

const subscribeGetPreviousWorkingDay = async ({ task, taskService }) => {

  const variables = new Variables();

  try {

    let startDate = task.variables.get('startDate');

    if (!startDate) startDate = moment().format('YYYY-MM-DD');

    const noOfDaysAhead = task.variables.get('noOfDaysAhead');

    const [err, result] = await to(Service
      .getThePreviousWorkingDay(startDate, noOfDaysAhead));

    if (err) TE(err);

    variables.set('systemDate', startDate);

    variables.set('previousWorkingDay', result);

    variables.set('result', result);

    variables.set('success', true);

    await taskService.complete(task, variables);

  } catch (error) {

    variables.set('error', error);
    variables.set('success', false);
    await taskService.handleBpmnError(task, 'ERROR_GET_PREVIOUS_DATE', error.toString(), variables);
  }
};

const subscribeGetNextWorkingDays = async ({ task, taskService }) => {

  const variables = new Variables();

  try {

    let startDate = task.variables.get('startDate');

    if (!startDate) startDate = moment().format('YYYY-MM-DD');

    const noOfDaysAhead = task.variables.get('noOfDaysAhead');

    const [err, result] = await to(Service
      .getNextWorkingDays(startDate, noOfDaysAhead));

    if (err) TE(err);

    variables.set('previousWorkingDay', result);

    variables.set('result', result);

    variables.set('success', true);

    await taskService.complete(task, variables);

  } catch (error) {

    variables.set('error', error);
    variables.set('success', false);
    await taskService.handleBpmnError(task, 'ERROR_GET_PREVIOUS_DATE', error.toString(), variables);
  }
};

const subscribeGetHolidaysForRelatedYear = async ({ task, taskService }) => {

  const variables = new Variables();
  const temporyLoanStopData = task.variables.get('temporyLoanStopData');

  try {

    const year = moment(temporyLoanStopData.startDate).get('year');

    const [err, result] = await to(Service.getHolidaysByGraterThanYear(year));

    if (err) TE(err);

    variables.set('holidays', result);
    variables.set('result', result);
    variables.set('success', true);

    await taskService.complete(task, variables);

  } catch (error) {

    variables.set('result', error);
    variables.set('error', error);
    variables.set('success', false);

    await taskService.handleBpmnError(
      task,
      'ERROR_GET_HOLIDAYS',
      'Unexpected Error Get Holidays',
      variables
    );
  }
};

const subscribeGetLastWorkingDay = async ({ task, taskService }) => {

  const variables = new Variables();

  const errorLog = getErrorLog(task);

  const ERROR = 'Unexpected Error Occurred while getting last working date';

  try {

    let startDate = task.variables.get('startDate');

    if (!startDate) {
      const error = { error: 'Start date parameter is missing' };
      Error.captureStackTrace(error);     
      TE(error);
    }

    const noOfDaysAhead = task.variables.get('noOfDaysAhead');
    
    startDate = moment(startDate).format('YYYY-MM-DD');

    const [err, result] = await to(Service.getLastWorkingDay(startDate, noOfDaysAhead));

    if (err) {
      const error = { error: err };
      Error.captureStackTrace(error);     
      TE(error);
    }
    
    if( !result ) {
      const error = { error: 'Working days results are empty' };
      Error.captureStackTrace(error);     
      TE(error);
    }
    
    variables.set('lastWorkingDay', result);

    // variables.set('result', result);

    // variables.set( `SUCCESS_${task.topicName}`, true);

    variables.set(task.executionId, {
      success: true
    });

    await taskService.complete(task, variables);

  } catch (error) {

    const errorStack = mapError(error, ERROR);

    Logger.error({
      module: 'CONFIGURATIONS',
      logData: {
        errorStack: errorStack,
        infoStack: mapTask(task)
      }
    });

    variables.set(task.executionId, {
      success: false,
      errorStack: errorStack
    });

    errorLog.push(ERROR);

    variables.set('errorLog', errorLog);

    await taskService.handleBpmnError(
      task,
      'ERROR_GET_LAST_WORKING_DATE',
      ERROR,
      variables
    );
  }
};

module.exports = {

  getHolidayByDate,

  subscribeGetTheNextWorkingDay,

  subscribeGetPreviousWorkingDay,

  subscribeGetHolidaysForRelatedYear,

  subscribeGetNextWorkingDays,
  
  subscribeGetLastWorkingDay,
};