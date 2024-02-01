const {
  getHolidayByDate,
  subscribeGetTheNextWorkingDay,
  subscribeGetPreviousWorkingDay,
  subscribeGetHolidaysForRelatedYear,
  subscribeGetNextWorkingDays,
  subscribeGetLastWorkingDay,
} = require('./subscriber');

module.exports = {

  subscribe: async (client) => {

    await client.subscribe('get-holiday-by-date', getHolidayByDate);

    await client.subscribe('get-the-next-working-day', subscribeGetTheNextWorkingDay);

    await client.subscribe('get-the-previous-working-day', subscribeGetPreviousWorkingDay);

    await client.subscribe('get-holidays-for-related-year', subscribeGetHolidaysForRelatedYear);

    await client.subscribe('get-next-working-days', subscribeGetNextWorkingDays);
    
    await client.subscribe('get-last-working-day', subscribeGetLastWorkingDay);
  }
};