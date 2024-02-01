const axios = require('axios');

const { Config } = require('../../config');

const { to, TE } = require('../helper');

const { baseUrl } = Config.AUTHENTICATION;
const baseURL= `${baseUrl}/authorization`;
// const AuthenticationServiceAPI = axios.create({
//   baseURL: `${baseUrl}/authorization`,
// });

// const AuthenticationServiceAPI = axios.defaults.baseURL = `${baseUrl}/authorization`;

const isAuthorized = async (headers) => {

  try {

    // const [err, response] = await to(AuthenticationServiceAPI.post('/is-authorized', null, { headers }));
    const [err, response] = await to(axios.default.post(baseURL+'/is-authorized', null, { headers }));
    if (err) TE(err.response ? err.response.data : err);

    return response.data.data;

  } catch (error) {

    TE(error);
  }
};

const isAuthenticated = async (accessLevels, headers) => {

  try {

    // const [err, response] = await to(AuthenticationServiceAPI.post('/is-authenticate', accessLevels, { headers }));
    const [err, response] = await to(axios.default.post(baseURL+'/is-authenticate', accessLevels, { headers }));
    
    if (err) TE(err.response ? err.response.data : err);

    return response.data.data;

  } catch (error) {

    TE(error);
  }
};

const getCamundaUsers = async (headers) => {

  try {

    // console.log(`${baseURL}/camunda-users`);

    const [err, response] = await to(axios.default
      .get(`${baseURL}/camunda-users`, { 
        headers: {
          authorization: headers.authorization
        }
      }));

    // console.log(err, response);

    if (err) TE(err.response ? err.response.data : err);

    return response.data.data;

  } catch (error) {

    TE(error);
  }
};

module.exports = {
  
  isAuthorized,

  isAuthenticated,

  getCamundaUsers
};