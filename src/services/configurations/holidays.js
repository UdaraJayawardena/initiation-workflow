const axios = require('@src/axios');

const { Config } = require('@config');


const holidayBaseUrl = `${Config.CONFIGURATIONS.baseUrl}/holidays`;

const getHolidayByDate = async (date) => {

  const url = `${holidayBaseUrl}/date/${date}`;

  const result = await axios.get(url);

  return result.data;
};

const getTheNextWorkingDay = async (startDay, noOfDaysAhead) => {

  const url = `${holidayBaseUrl}/next-working-day/${startDay}/${noOfDaysAhead}`;

  const result = await axios.get(url);

  return result.data;
};

const getThePreviousWorkingDay = async (startDay, noOfDaysAhead) => {

  const url = `${holidayBaseUrl}/previous-working-day/${startDay}/${noOfDaysAhead}`;

  const result = await axios.get(url);

  return result.data;
};

const getHolidaysByGraterThanYear = async (year) => {

  const url = `${holidayBaseUrl}/years/${year}/gt`;

  const result = await axios.get(url);

  return result.data;
};

const getNextWorkingDays = async (startDay, noOfWorkingDaysNeeded) => {

  const url = `${holidayBaseUrl}/next-working-day/multiple/${startDay}/${noOfWorkingDaysNeeded}`;

  const result = await axios.get(url);

  return result.data;
};

const getLastWorkingDay = async (startDay, noOfDaysAhead) => {

  const url = `${holidayBaseUrl}/last-working-day/${startDay}/${noOfDaysAhead}`;

  const result = await axios.get(url);

  return result.data;
};

module.exports = {

  getHolidayByDate,

  getTheNextWorkingDay,

  getThePreviousWorkingDay,

  getHolidaysByGraterThanYear,

  getNextWorkingDays,
  
  getLastWorkingDay,
};
