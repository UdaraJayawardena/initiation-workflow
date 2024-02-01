// const moment = require('moment');

const Database = require('./database');

const { AllowedFilters } = require('./constants');

const { TE, to } = require('@src/helper');

const { APPLICATION } = require('@config').Config;

const _mapCreateSetObject = (setObject) => {

  if(!setObject.cluster) setObject.cluster = APPLICATION.APP_CLUSTER;

  if(!setObject.app) setObject.app = APPLICATION.APP_KEY;

  if (APPLICATION.IS_PROD) {
    setObject.createdAt = Date.now();
    setObject.updatedAt = Date.now();
    return setObject;
  }

  return setObject;
};

const _getAllowedQuery = (queryParams) => {

  const query = {};

  if (queryParams && Object.keys(queryParams).length > 0) {
    for (const item in queryParams) {
      const firstItem = item.split('.')[0];
      if (AllowedFilters.includes(firstItem)) query[item] = queryParams[item];
    }
  }

  return query;
};

const createLog = async (log) => {

  try {

    const setObject = _mapCreateSetObject(log);

    const [error, result] = await to(Database.create(setObject));

    if (error) TE(error);

    return result;

  } catch (error) {
    console.log('Service : createLog : ', error);
    TE(error);
  }
};

const getLogs = async (queryBody = {}, queryParams = {}) => {

  const page = queryParams.page;

  const noOfLogsPP = queryParams.noOfLogsPP;

  const query = _getAllowedQuery({
    ...queryBody,
    ...queryParams
  });

  // if (createdAt) {
  //   filter.$and = [
  //     { createdAt: { $gte: moment(createdAt).toISOString() } },
  //     { createdAt: { $lt: moment(createdAt).add(1, 'd').toISOString() } }
  //   ];
  // }

  const options = page && noOfLogsPP ? {
    skip: (Number(page)-1) * Number(noOfLogsPP),
    limit: Number(noOfLogsPP)
  } : {};

  const [err, count] = await to(Database.countByQuery(query));

  if (err) TE(err);

  const [error, result] = await to(Database.findByQuery(query, options));

  if (error) TE(error);

  return {
    totalOfLogs: count,
    logs: result
  };
};

const getLog = async (queryParams = {}) => {

  const query = _getAllowedQuery(queryParams);

  const [err, result] = await to(Database.findOneByQuery(query));

  if (err) TE(err);

  return result;
};

module.exports = {

  createLog,

  getLogs,

  getLog,
};