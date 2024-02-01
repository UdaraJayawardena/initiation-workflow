// const axios = require('axios');

// const { Config } = require('../../../../config');

// const { baseUrl } = Config.CAMUNDA;

// const CamundaService = axios.default.create({
//   baseURL: baseUrl + '/process-definition'
// });

// const startProcessDefinitionByKey = async ({ key, businessKey, variables }) => {

//   const result = await CamundaService.post(`/key/${key}/start`, {
//     variables,
//     businessKey
//   });

//   return result;
// };


// const startProcessDefinitionById = async ({ id, data }) => {

//   const result = await CamundaService.post(`/${id}/start`, data);

//   return result;
// };


// const startProcessDefinitionByKeyForTenant = async ({ key, tenantId, data }) => {

//   const result = await CamundaService.post(`/key/${key}/tenant-id/${tenantId}/start`, data);

//   return result;
// };

// module.exports = {
//   startProcessDefinitionByKey,
//   startProcessDefinitionById,
//   startProcessDefinitionByKeyForTenant,
// };
