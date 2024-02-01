const Constants = require('../../../constants');

const MODULE_CODE = Constants.ModuleCodes.PROCESS_DEFINITIONS;

const _setCode = Constants.setCode('')(MODULE_CODE);

const CustomCodes = {
  SUCCESS: { ..._setCode(1, 200), message: 'ok' },
  ERR_PROCESS_DEF_KEY_NOT_FOUND: { ..._setCode(1, 400), message: 'Process definition key not found!' },
  ERR_BUSINESS_KEY_NOT_FOUND: { ..._setCode(2, 400), message: 'Business key not found!' },
  ERR_TENANT_ID_NOT_FOUND: { ..._setCode(3, 400), message: 'Tenant id not found!' },
};

module.exports = {
  CustomCodes,
  CoreConstants: Constants
};