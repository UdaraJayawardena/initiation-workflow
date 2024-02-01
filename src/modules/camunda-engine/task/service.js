// const axios = require('axios');

// const { Config } = require('../../../../config');

// const { baseUrl } = Config.CAMUNDA;
// const systemUserId = Config.SYSTEM.userId;

// const CamundaService = axios.default.create({
//   baseURL: baseUrl + '/task'
// });

// const claimTask = async ({ id, userId }) => {

//   const data = {
//     userId: userId || systemUserId
//   };

//   const result = await CamundaService.post(`/${id}/claim`, data, {
//     auth: {
//       username: 'demo',
//       password: 'demo'
//     },
//   });

//   return result;
// };


// const completeTask = async ({ id, variables, withVariablesInReturn }) => {

//   const result = await CamundaService.post(`/${id}/complete`, {
//     variables,
//     withVariablesInReturn: withVariablesInReturn === true
//   }, {
//     auth: {
//       username: 'demo',
//       password: 'demo'
//     },
//   });

//   return result;
// };

// module.exports = {
//   claimTask,
//   completeTask,
// };
