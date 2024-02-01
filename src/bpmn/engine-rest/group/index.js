const service = require('./service');

const member = require('./member');

module.exports = {

  ...service,

  Member: member
};