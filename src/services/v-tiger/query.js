const projection = (projects) => {

  if (!projects || projects.length <= 0)
    return 'SELECT *';

  projects = projects.reduce((p, c) => `${c}, ${p}`, '');

  projects = projects.slice(0, projects.length - 2);

  return `SELECT ${projects}`;
};

const selectQuery = (table, whereObj, projects) => {

  let query = `${projection(projects)} FROM ${table} WHERE`;

  Object.keys(whereObj).forEach(key => {
    const { value, nextOperator, condition } = whereObj[key];

    query += ` ${key} ${condition ? condition : '='} '${value}' ${nextOperator ? nextOperator : ''}`;
  });

  return `${query};`;
};

module.exports = {
  selectQuery
};