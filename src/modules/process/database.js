const Counter = require('@src/modules/counter');

const Schema = require('./process');

const mapSetObjectList = async (setObjectList) =>{

  for (let i = 0; i < setObjectList.length; i++) {

    const setObject = setObjectList[i];
    
    const id = await Counter.getNextSequence('processId');
  
    setObject.id = `PRO${id}`;

    setObjectList[i] = setObject;
  }

  return setObjectList;
};

const create = async (setObject) => {

  const id = await Counter.getNextSequence('processId');

  setObject.id = `PRO${id}`;

  return await Schema.create(setObject);
};

const insertMany = async processList => {

  const setObjects = await mapSetObjectList(processList);

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