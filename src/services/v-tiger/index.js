const Accounts = require('./accounts');
const Users = require('./users');
const Potentials = require('./potential');
const ModComments = require('./mod-comments');

module.exports = {
  ...Accounts,
  ...Users,
  ...Potentials,
  ...ModComments
};