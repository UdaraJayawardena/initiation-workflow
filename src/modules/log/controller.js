const Service = require('./service');

const Tracer = require('../../tracer');

const { SUCCESS, ERROR } = require('../../helper');

const { CustomCodes } = require('../../constants');

const component = 'Controller';

const test = async (req, res) => {

  try {

    Tracer.createLog(req.span, 'processing', {
      method: 'test',
      component: component
    });

    const { testValue } = req.query;

    const response = await Service.test(testValue);

    SUCCESS(res, CustomCodes.SUCCESS, response);

  } catch (error) {

    ERROR(res, error);
  }
};

const getLogs = async (req, res) => {

  try {

    const queryBody = req.body ? req.body : {};

    const queryParams = req.query ? req.query : {};

    Tracer.createLog(req.span, 'processing', {
      method: 'getLogs',
      component: component
    });

    const response = await Service.getLogs(queryBody, queryParams);

    SUCCESS(res, CustomCodes.SUCCESS, response);
  } catch (error) {

    ERROR(res, error);
  }
};

module.exports = {

  test,

  getLogs
};
