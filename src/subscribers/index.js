const Configurations = require('./configurations');

const InitiationManagement = require('./initiation-management');

const CrmGateway = require('./crm-gateway');

const Common = require('./common');

const BaiManagement = require('./bai-management');

const InitiationGateway = require('./initiation-api-gateway');

const Notifications = require('./notification');

const CleanupHistory = require('./cleanup-history');

const subscribeAll = async (client) => {

  await Configurations.subscribe(client);

  await InitiationManagement.subscribe(client);

  await CrmGateway.subscribe(client);

  await Common.subscribe(client);

  await BaiManagement.subscribe(client);

  await InitiationGateway.subscribe(client);

  await Notifications.subscribe(client);

  await CleanupHistory.subscribe(client);
};

module.exports = subscribeAll;