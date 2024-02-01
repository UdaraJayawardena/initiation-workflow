const Constants = require('@src/constants');

const SERVICE_CODE = Constants.SubServiceCodes.INITIATION_MANAGEMENT;

const setCode = Constants.setCode(SERVICE_CODE);

const ModuleCodes = {
  CONTRACT: 1,
  CONTRACT_PARTY: 2,
  SME_LOAN_REQUEST: 3,
  SME_LOAN_REQUEST_PROPOSAL: 4
};

const Status = {
  ACTIVE: 'active',
  IN_ACTIVE: 'in-active'
};

const Action = {
  NONE: 'none',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  DISCONNECT: 'disconnect'
};

const Language = {
  DUTCH: 'dutch'
};

module.exports = {

  ModuleCodes,

  Status,

  Action,

  Language,

  setCode,
};