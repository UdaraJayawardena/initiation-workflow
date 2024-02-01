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

    SUCCESS(res, CustomCodes.SUCCESS, response, req.span);

  } catch (error) {

    ERROR(res, error, req.span);
  }
};

const seedProcess = async (req, res) => {

  try {

    Tracer.createLog(req.span, 'processing', {
      method: 'seedProcess',
      component: component
    });

    const response = await Service.seedProcess();

    SUCCESS(res, CustomCodes.SUCCESS, response, req.span);
  } catch (error) {

    ERROR(res, error, req.span);
  }
};

const getProcessList = async (req, res) => {

  try {

    const queryBody = req.body ? req.body : {};

    const queryParams = req.query ? req.query : {};

    Tracer.createLog(req.span, 'processing', {
      method: 'getProcessList',
      component: component
    });

    const response = await Service.getProcessList(queryBody, queryParams);

    SUCCESS(res, CustomCodes.SUCCESS, response, req.span);
  } catch (error) {

    ERROR(res, error, req.span);
  }
};

module.exports = {

  test,

  seedProcess,

  getProcessList
};
