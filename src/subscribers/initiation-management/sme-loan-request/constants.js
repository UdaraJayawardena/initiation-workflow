const Constants = require('../constants');

const MODULE_CODE = Constants.ModuleCodes.PERSON_IDENTITY;

const _setCode = Constants.setCode(MODULE_CODE);

const TERMS_MAPPING = {
  0: {
    daily: -1,
    weekly: -1,
    monthly: -1
  },
  1: {
    daily: 22,
    weekly: 4,
    monthly: 1
  },
  2: {
    daily: 44,
    weekly: 8,
    monthly: 2
  },
  3: {
    daily: 65,
    weekly: 13,
    monthly: 3
  },
  4: {
    daily: 87,
    weekly: 18,
    monthly: 4
  },
  5: {
    daily: 109,
    weekly: 22,
    monthly: 5
  },
  6: {
    daily: 130,
    weekly: 26,
    monthly: 6
  },
  7: {
    daily: 152,
    weekly: 30,
    monthly: 7
  },
  8: {
    daily: 174,
    weekly: 35,
    monthly: 8
  },
  9: {
    daily: 195,
    weekly: 39,
    monthly: 9
  },
  10: {
    daily: 217,
    weekly: 44,
    monthly: 10
  },
  11: {
    daily: 239,
    weekly: 48,
    monthly: 11
  },
  12: {
    daily: 260,
    weekly: 52,
    monthly: 12
  },
  13: {
    daily: 282,
    weekly: 56,
    monthly: 13
  },
  14: {
    daily: 303,
    weekly: 61,
    monthly: 14
  },
  15: {
    daily: 325,
    weekly: 65,
    monthly: 15
  },
  16: {
    daily: 346,
    weekly: 69,
    monthly: 16
  },
  17: {
    daily: 368,
    weekly: 74,
    monthly: 17
  },
  18: {
    daily: 390,
    weekly: 78,
    monthly: 18
  },
  19: {
    daily: 412,
    weekly: 82,
    monthly: 19
  },
  20: {
    daily: 433,
    weekly: 86,
    monthly: 20
  },
  21: {
    daily: 455,
    weekly: 91,
    monthly: 21
  },
  22: {
    daily: 477,
    weekly: 95,
    monthly: 22
  },
  23: {
    daily: 498,
    weekly: 100,
    monthly: 23
  },
  24: {
    daily: 520,
    weekly: 104,
    monthly: 24
  }
};

const customCodes = {

  ERR_ACTION_NOT_FOUND: { ..._setCode(1, 400), message: 'Action not found!' },
  ERR_PERSON_IDENTITY_NOT_FOUND: { ..._setCode(2, 400), message: 'Person identity not found!' },
  ERR_RELATION_NOT_FOUND: { ..._setCode(3, 400), message: 'Person identity relation not found!' }
};

module.exports = {

  TERMS_MAPPING,
  
  customCodes,
};