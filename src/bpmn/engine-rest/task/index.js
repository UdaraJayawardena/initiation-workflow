const service = require('./service');

const Variables = require('./variables');

module.exports = {

  ...service,

  Variables: Variables,
};