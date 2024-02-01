const { selectQuery } = require('./query');

const Service = require('./service');

const { to, TE } = require('@src/helper');

const getUsers = async (conditions, fieldList) => {

  const query = selectQuery('Users',
    conditions, //{ account_no: { value: accountNo } },
    fieldList, //['id', 'opportunity_id']
  );

  const [err, result] = await to(Service.query(query));

  if (err) TE(err);

  return result;
};

module.exports = {
  getUsers,
};