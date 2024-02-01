const Counter = require('@src/modules/counter');

const Schema = require('./logs');

const mapSetObjectList = async (setObjectList) =>{

  for (let i = 0; i < setObjectList.length; i++) {

    const setObject = setObjectList[i];
    
    const id = await Counter.getNextSequence('logId');
  
    setObject.id = `${setObject.cluster}_${setObject.app}_${id}`;

    setObjectList[i] = setObject;
  }

  return setObjectList;
};

const create = async (setObject) => {

  const id = await Counter.getNextSequence('logId');

  setObject.id = `${setObject.cluster}_${setObject.app}_${id}`;

  return await Schema.create(setObject);
};

const insertMany = async logs => {

  const setObjects = mapSetObjectList(logs);

  return await Schema.insertMany(setObjects);
};

const findByQuery = async (query, options) =>
  await Schema.find(query, null, options);

const findOneByQuery = async (query) =>
  await Schema.findOne(query);

const countByQuery = async (query) => 
  await Schema.countDocuments(query);


module.exports = {

  create,

  insertMany,

  findByQuery,

  findOneByQuery,

  countByQuery,
};