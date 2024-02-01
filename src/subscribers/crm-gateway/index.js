const {
  getCrmData,
  updateCustomer,
  updatePerson,
  updateStakeholder,
  getCustomerDetail,
  prepareUpdateCrmInitiation
} = require('./subscriber');

const sqsListener = require('./sqs-listener');

module.exports = {

  subscribe: async (client) => {

    sqsListener();

    await client.subscribe('get-crm-data', getCrmData);

    await client.subscribe('get-customer-detail', getCustomerDetail);

    await client.subscribe('update-customer', updateCustomer);

    await client.subscribe('update-person', updatePerson);

    await client.subscribe('update-stakeholder', updateStakeholder);
    
    await client.subscribe('prepare-update-crm-initiation', prepareUpdateCrmInitiation);
  },
};