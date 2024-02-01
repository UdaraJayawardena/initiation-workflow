const axios = require('@src/axios');

const { to, TE } = require('@src/helper');

const { Config } = require('@config');

const { baseUrl } = Config.CRM_GATEWAY;

const getCustomerAddressesContacts = async (params, headerToken) => {

  const url = `${baseUrl}/get-customer-address-contact`;

  const result = await axios.get(url, {
    ...headerToken,
    params: params
  });

  return result.data;
};

const getPersonAddressesContacts = async (params, headerToken) => {

  const url = `${baseUrl}/get-person-address-contact`;

  const result = await axios.get(url, {
    ...headerToken,
    params: params
  });

  return result.data;
};

const getStakeholders = async (customerId, headerToken) => {

  const url = `${baseUrl}/get-stakeholder`;

  const result = await axios.get(url, {
    ...headerToken,
    params: { customerId: customerId }
  });

  return result.data;
};

const _getPersonAddressesContacts = async (personId, headerToken) => {

  const url = `${baseUrl}/get-person-address-contact`;

  const result = await axios.get(url, {
    ...headerToken,
    params: { mongoId: personId }
  });

  return result.data;
};

const getCompanyStructures = async (params, headerToken) => {

  const url = `${baseUrl}/get-company-structures`;

  const result = await axios.get(url, {
    ...headerToken,
    params: params
  });

  return result.data;
};

const getContacts = async (params, headerToken) => {

  const url = `${baseUrl}/get-contacts`;

  const result = await axios.get(url, {
    ...headerToken,
    params: params
  });

  return result.data;
};

const updateCustomer = async (data, headerToken) => {

  const url = `${baseUrl}/cud-customer`;

  const result = await axios.post(url, data, headerToken);

  return result.data;
};

const updatePerson = async (data, headerToken) => {

  const url = `${baseUrl}/cud-person`;

  const result = await axios.post(url, data, headerToken);

  return result.data;
};

const updateStakeholder = async (data, headerToken) => {

  const url = `${baseUrl}/update-stakeholders`;

  const result = await axios.post(url, {
    stakeholders: { data: data }
  }, headerToken);

  return result.data;
};

const getNamePrefixes = async (headerToken) => {

  const url = `${baseUrl}/get-name-prefixes`;

  const result = await axios.get(url, headerToken);

  return result.data;
};

const getCrmData = async (customerId, headerToken) => {

  const [customerErr, customer] = await to(getCustomerAddressesContacts(customerId, headerToken));

  if (customerErr) {
    const error = { error: customerErr };
    Error.captureStackTrace(error);
    TE(error);
  }
  
  const customerAddress = customer.address.find(address => address.type == 'physical' && !address.endDate);

  if(!customerAddress) {
    const error = { error: 'No physical Address found; follow manual route' };
    Error.captureStackTrace(error);
    TE(error);
  }

  customer.physicalAddress = customerAddress;

  const [stakeholderErr, stakeholders] = await to(getStakeholders(customer.customer._id, headerToken));

  if (stakeholderErr) {
    const error = { error: stakeholderErr };
    Error.captureStackTrace(error);
    TE(error);
  }

  const signingContractIndicator = stakeholders.filter(stakeholder => stakeholder.signingContractIndicator == 'yes' && !stakeholder.endDate);

  const signingGuaranteeIndicator = stakeholders.filter(stakeholder => stakeholder.signingGuaranteeIndicator == 'yes' && !stakeholder.endDate);

  if (!signingContractIndicator.length || !signingGuaranteeIndicator.length) {
    const error = { error: 'No Person found who may sign the contract / deed-of-pledge; follow manual route' };
    Error.captureStackTrace(error);
    TE(error);
  }

  const stakeholderList = signingContractIndicator.concat(signingGuaranteeIndicator.filter((item) => signingContractIndicator.indexOf(item) < 0));

  const stakeholderPersonList = [];

  for (let i = 0; i < stakeholderList.length; i++) {

    const stakeholder = stakeholderList[i];

    const [personErr, person] = await to(_getPersonAddressesContacts(stakeholder.personId, headerToken));

    if (personErr) {
      const error = { error: personErr };
      Error.captureStackTrace(error);
      TE(error);
    }

    if (!person) {
      const error = { error: 'No Person found who may sign the contract / deed-of-pledge; follow manual route' };
      Error.captureStackTrace(error);
      TE(error);
    }

    // const personContacts = person.contact;

    // if (personContacts.length > 0) {

    //   const filteredPhoneNumbers = personContacts.filter(contact => contact.status == 'active' && contact.type == 'phone');

    //   if (filteredPhoneNumbers.length == 0) {
    //     const error = { error: 'No Phone-No found for Person who may sign the contract / deed-of-pledge; follow manual route' };
    //     Error.captureStackTrace(error);
    //     TE(error);
    //   }

    //   person.phone = filteredPhoneNumbers.length == 1 ? filteredPhoneNumbers[0] : filteredPhoneNumbers.find(filteredPhoneNumber => filteredPhoneNumber.subType == 'work');

    //   const filteredEmails = personContacts.filter(contact => contact.status == 'active' && contact.type == 'email');

    //   if (filteredEmails.length == 0) {
    //     const error = { error: 'No E-mail found for Person who may sign the contract / deed-of-pledge; follow manual route' };
    //     Error.captureStackTrace(error);
    //     TE(error);
    //   }

    //   person.email = filteredEmails.length == 1 ? filteredEmails[0] : filteredEmails.find(filteredEmail => filteredEmail.subType == 'work');
    // }

    stakeholder.person = person;

    stakeholderPersonList.push(stakeholder);
  }

  return { stakeholders: stakeholderPersonList, customer: customer };
};

const getCustomerDetails = async (params, headerToken) => {

  const url = `${baseUrl}/get-customer-details`;

  const result = await axios.get(url, {
    ...headerToken,
    params: params
  });

  return result.data;
};

const getPersonDetails = async (params, headerToken) => {

  const url = `${baseUrl}/get-persons`;

  const result = await axios.get(url, {
    ...headerToken,
    params: params
  });

  return result.data;
};


module.exports = {

  updateCustomer,

  updatePerson,

  updateStakeholder,

  getNamePrefixes,

  getCrmData,

  getCompanyStructures,

  getCustomerDetails,

  getCustomerAddressesContacts,

  getPersonDetails,

  getStakeholders,

  getContacts,

  getPersonAddressesContacts
};