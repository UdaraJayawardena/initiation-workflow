const axios = require('@src/axios');

const { Config } = require('@config');

const baseUrl = `${Config.NOTIFICATIONS.baseUrl}/emails`;


const sendEmail = async (data, params) => {

  const url = baseUrl;

  const result = await axios.post( url, data, {params:params});

  return result.data;
};


module.exports = {

  sendEmail
};