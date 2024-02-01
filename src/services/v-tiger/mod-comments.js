const { selectQuery } = require('./query');

const Service = require('./service');

const { to, TE } = require('@src/helper');

const MODULE = 'ModComments';

const mapCreateModComment = (element) => ({
  commentcontent: element.commentcontent,
  assigned_user_id: '20x20',
  related_to: element.relatedTo
});

const mapUpdateModComment = (element) => ({
  id: element.id,
  commentcontent: element.commentcontent
});

const createModComment = async (element) => {

  element = mapCreateModComment(element);

  const [err, result] = await to(Service.create(element, MODULE));

  if (err) TE(err);

  return result;
};

const reviseModComment = async (element) => {

  element = mapUpdateModComment(element);

  const [err, result] = await to(Service.revise(element, MODULE));

  if (err) TE(err);

  return result;
};

const getModComments = async (conditions, fieldList) => {

  const query = selectQuery(MODULE,
    conditions, //{ account_no: { value: accountNo } },
    fieldList, //['id', 'opportunity_id']
  );

  const [err, result] = await to(Service.query(query));

  if (err) TE(err);

  return result;
};

module.exports = {
  createModComment,
  reviseModComment,
  getModComments,
};