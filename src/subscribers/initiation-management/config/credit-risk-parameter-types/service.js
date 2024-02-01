const axios = require('@src/axios');

const { Config } = require('@config');

const { baseUrl } = Config.INITIATION_MANAGEMENT;
const creditRiskParamererTypeURL = `${baseUrl}/config/credit-risk-parameter-types`;
const creditRiskParameterURL = `${baseUrl}/credit-risk-parameters`;

const createCreditRiskParameterTypes = async (data, headerToken) => {

  const result = await axios.post(`${creditRiskParamererTypeURL}`,
    data, headerToken);

  return result.data;
};

const updateCreditRiskParameterTypes = async (data, headerToken) => {

  const result = await axios.put(`${creditRiskParamererTypeURL}`,
    data, headerToken);
  
  return result.data;
};

const deleteCreditRiskParameterTypes = async (id, headerToken) => {

  const result = await axios.del(`${creditRiskParamererTypeURL}/${id}`,
    headerToken);
  
  return result.data;
};

const getCreditRiskParameterList = async (params) => {
  
  const url = `${creditRiskParameterURL}/query${params}`;
  const response = await axios.get(url);
  
  return response.data;
};


module.exports = {
  createCreditRiskParameterTypes,
  updateCreditRiskParameterTypes,
  deleteCreditRiskParameterTypes,
  getCreditRiskParameterList
};