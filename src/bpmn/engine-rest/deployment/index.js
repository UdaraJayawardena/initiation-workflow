const create = require('./create');

const del = require('./delete');

const Service = require('./service');

module.exports = {

  ...Service,

  ...create,

  ...del
};