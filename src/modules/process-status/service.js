// const moment = require('moment');

const Database = require('./database');

const { AllowedFilters } = require('./constants');

const SeedData = require('./seed-data');

const { TE, to } = require('@src/helper');

// const { APPLICATION } = require('@config').Config;

// const _mapCreateSetObject = (setObject) => {

//   if (APPLICATION.IS_PROD) {
//     setObject.createdAt = Date.now();
//     setObject.updatedAt = Date.now();
//     return setObject;
//   }

//   return setObject;
// };

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

const seedProcessStatus = async () => {

  const [findErr, resultList] = await to(Database.findByQuery({}));

  if(findErr) TE(findErr);

  if(resultList.length > 0 ) return resultList;

  const [err, result] = await to(Database.insertMany(SeedData));

  if (err) TE(err);

  return result;
};

// const createProcessStatus = async (log) => {

//   const setObject = _mapCreateSetObject(log);

//   const [error, result] = await to(Database.create(setObject));

//   if (error) TE(error);

//   return result;
// };

const getProcessStatusList = async (queryBody = {}, queryParams = {}) => {

  const page = queryParams.page;

  const noOfLogsPP = queryParams.noOfLogsPP;

  const query = _getAllowedQuery({
    ...queryBody,
    ...queryParams
  });

  const options = page && noOfLogsPP ? {
    skip: (Number(page)-1) * Number(noOfLogsPP),
    limit: Number(noOfLogsPP)
  }: {};

  const [err, count] = await to(Database.countByQuery(query));

  if (err) TE(err);

  const [error, result] = await to(Database.findByQuery(query, options));

  if (error) TE(error);

  return {
    totalOfStatus: count,
    statusList: result
  };
};

// const getProcess = async (queryParams = {}) => {

//   const query = _getAllowedQuery(queryParams);

//   const [err, result] = await to(Database.findOneByQuery(query));

//   if (err) TE(err);

//   return result;
// };

module.exports = {

  seedProcessStatus,

  // createProcess,

  getProcessStatusList,

  // getProcess,
};