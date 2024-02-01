module.exports = (
  smeLoanRequest, 
  creditRiskParameterType, 
  value, 
  source) => ({
  creditRiskParameterTypeId: creditRiskParameterType.id,
  smeLoanRequest: smeLoanRequest._id,
  smeLoanRequestId: smeLoanRequest.id,
  type: creditRiskParameterType.type,
  value: value,
  source: source
});