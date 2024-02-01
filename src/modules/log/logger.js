const Service = require('./service');

const { Level } = require('./constants');

const _bindLevel = (log, levelVal) => {
  log.level = Level[levelVal];
  return log;
};

const critical = log => Service.createLog(_bindLevel(log, 50))
  .catch(err => console.log(err));

const error = log => Service.createLog(_bindLevel(log, 40))
  .catch(err => console.log(err));

const warning = log => Service.createLog(_bindLevel(log, 30))
  .catch(err => console.log(err));

const info = log => Service.createLog(_bindLevel(log, 20))
  .catch(err => console.log(err));

const debug = log => Service.createLog(_bindLevel(log, 10))
  .catch(err => console.log(err));

const log = (log, level) => {

  log.level = level;

  Service.createLog(log).catch(err => console.log(err));
};

module.exports = {

  critical,

  error,

  warning,

  info,

  debug,

  log
};