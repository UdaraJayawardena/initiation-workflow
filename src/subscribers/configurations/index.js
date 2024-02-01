// const Banks = require('./banks');

const Holidays = require('./holidays');

module.exports = {

  subscribe: async (client) => {

    // await Banks.subscribe(client);

    await Holidays.subscribe(client);
  }
};