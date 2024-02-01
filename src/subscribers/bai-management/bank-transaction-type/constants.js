const Constants = require('../constants');

const MODULE_CODE = Constants.ModuleCodes.CONTRACT_PARTY;

const _setCode = Constants.setCode(MODULE_CODE);

const customCodes = {

  ERR_ACTION_NOT_FOUND: { ..._setCode(1, 400), message: 'Action not found!' },
  ERR_PERSON_IDENTITY_NOT_FOUND: { ..._setCode(2, 400), message: 'Person identity not found!' },
  ERR_RELATION_NOT_FOUND: { ..._setCode(3, 400), message: 'Person identity relation not found!' }
};
  

const codes = {

  SUCCESS: { code: 99, message: 'Successfull' },
  RECORD_EXITS: { code: 1, message: 'Record already exist' },
  IMPOSSIBLE: { code: 2, message: 'Deletion impossible' }
};

module.exports = {
  codes,
  customCodes
};