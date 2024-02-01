const Level = {
  50: 'CRITICAL',
  40: 'ERROR',
  30: 'WARNING',
  20: 'INFO',
  10: 'DEBUG',
  0: 'NOT_SET'
};

const components = ['direct-debit-batch', 'none'];

const status = ['success', 'warning', 'block', 'error', 'none'];

const priority = [0, 1, 2, 3];

const AllowedFilters = ['id', 'cluster', 'app', 'type', 'logData'];

module.exports = {
  Level,
  components,
  status,
  priority,
  AllowedFilters
};