const { AWSService } = require('../../services');

const { SQSService } = AWSService;

const { Config } = require('../../../config');

const { updateCrmSystemQueue } = Config.AWS_CONFIGS;

const { updateCrmSystem } = require('./update-crm-system');

const updateCrmSystemListener = () => {
  SQSService.getConsumer(
    updateCrmSystemQueue,
    'updateCrmSystemListener',
    async (message) => {
      console.info(`START_UPDATE_CRM_SYSTEM : ${message.smeLoanRequestId}`);
      await updateCrmSystem(message);
      console.info(`END_UPDATE_CRM_SYSTEM : ${message.smeLoanRequestId}`);
    }
  );
};

module.exports = () => {
  updateCrmSystemListener();
};
