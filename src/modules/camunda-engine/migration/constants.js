const Constants = require('../../../constants');

const MODULE_CODE = Constants.ModuleCodes.PROCESS_DEFINITIONS;

const _setCode = Constants.setCode('')(MODULE_CODE);

const CustomCodes = {
  SUCCESS: { ..._setCode(1, 200), message: 'ok' },
  ERR_SOURCE_PROCESS_DEFINITION_ID_NOT_FOUND: { ..._setCode(1, 400), message: 'Process definition id not found!' },
  ERR_TARGET_PROCESS_DEFINITION_ID_NOT_FOUND: { ..._setCode(2, 400), message: 'Process target id not found!' },
  ERR_EVENT_TRIGGER_NOT_FOUND: { ..._setCode(3, 400), message: 'Event trigger not found!' },
  SUCCESS_MESSAGE: { ..._setCode(3, 200), message: 'Workflow migration success' },
  VALIDATION_ERROR: { ..._setCode(3, 400), message: 'Miration Validation Error Occoured!' },
  GENERATE_ERROR: { ..._setCode(3, 400), message: 'Miration Generate Error Occoured!' },
  PROCESS_INSTANCE_EMPTY: { ..._setCode(3, 204), message: 'Process instances empty to migrate!' },
};

module.exports = {
  CustomCodes,
  CoreConstants: Constants
};