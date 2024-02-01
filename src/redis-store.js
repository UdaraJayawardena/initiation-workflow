const redis = require('redis');

const { APPLICATION } = require('../config').Config;

//setup port constants
const redisPort = APPLICATION.REDIS_PORT;
const redisHost = APPLICATION.REDIS_HOST;

//configure redis client on port 6379
const redisClient = redis.createClient({
  port: redisPort,
  host: redisHost
});

redisClient.on('error', (err) => {
  console.log(err);
});

const _parseToObject = (value) => {
  try { return JSON.parse(value); } catch (error) { return value; }
};

const getData = (key) => {
  return new Promise((resolve, reject) => {
    redisClient.get(key, (err, data) => {
      if (err) {
        console.log(err);
        reject({ code: 404, message: 'Error occur while getting data from cache.' });
      }
      //if no match found
      if (data != null) {
        resolve(_parseToObject(data));
      } else {
        resolve(null);
      }
    });
  });
};

const setData = async (key, value) => {
  return new Promise((resolve, reject) => {
    redisClient.set(key, JSON.stringify(value), (err, data) => {
      if (err) {
        console.log(err);
        return reject({ code: 404, message: 'Error occur while setting data to cache.' });
      }

      resolve(data);
    });
  });
};

const deleteData = async (key) => {
  return new Promise((resolve, reject) => {
    redisClient.del(key, (err, data) => {
      if (err) {
        console.log(err);
        return reject({ code: 404, message: 'Error occur while deleting data from cache.' });
      }

      resolve(data);
    });
  });
};

module.exports = {
  getData,
  setData,
  deleteData
};