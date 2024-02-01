const SERVICE_CODE = 2;

const ModuleCodes = {
  PROCESS_DEFINITIONS: 1
};

const SubServiceCodes = {
  INITIATION_MANAGEMENT: 3,
};

const setCode = subServiceCode => moduleCode => (code, httpCode) => ({
  ssc: subServiceCode,
  mc: moduleCode,
  code: code,
  hc: httpCode,
  isBPMN: true,
});

const _setCode = setCode('')('');

const CustomCodes = {
  SUCCESS: { ..._setCode(1, 200), message: 'ok' },
  ERR_PROCESS_NOT_FOUND: { ..._setCode(1, 400), message: 'Process not deployed!' },
  ERR_TOMCAT_SERVER_OFFLINE: { ..._setCode(2, 400), message: 'Tomcat Server Offine!' },
  ERR_BPMN_RESOLVE: { ..._setCode(3, 400), message: 'BPMN Request resolved error!' },
};

module.exports = {
  SERVICE_CODE,
  ModuleCodes,
  SubServiceCodes,
  setCode,
  CustomCodes,
};