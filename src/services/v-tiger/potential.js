const { selectQuery } = require('./query');

const Service = require('./service');

const { to, TE } = require('@src/helper');

const MODULE = 'Potentials';

const getPotentials = async (conditions, fieldList) => {

  const query = selectQuery(MODULE,
    conditions, //{ account_no: { value: accountNo } },
    fieldList, //['id', 'opportunity_id']
  );

  const [err, result] = await to(Service.query(query));

  if (err) TE(err);

  return result;
};

const revisePotential = async (element) => {

  const [err, result] = await to(Service.revise(element, MODULE));

  if (err) TE(err);

  return result;
};

const createPotential = async (element) => {

  const [err, result] = await to(Service.create(element, MODULE));

  if (err) TE(err);

  return result;
};

module.exports = {
  getPotentials,
  revisePotential,
  createPotential
};