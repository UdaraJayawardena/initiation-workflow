const projection = (projects) => {

  if(!projects || projects.length <= 0) 
    return 'SELECT *'; 

  projects = projects.reduce((p, c) => `${p},${c}`, '');

  projects = projects.slice(1);

  return `SELECT ${projects}`;
};

const selectQuery = (table, whereObj, projects) => {

  let query = `${projection(projects)} FROM ${table} WHERE`;

  Object.keys(whereObj).forEach( key => {
    const { value, nextOperator } = whereObj[key];
    query += ` ${key}= '${value}' ${nextOperator}`;
  });

  return `${query};`;
};


module.exports = {

  selectQuery
};