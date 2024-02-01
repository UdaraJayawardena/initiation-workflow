const { Variables } = require('camunda-external-task-client-js');

const Service = require('./service');

const { to, TE, mapTask, getErrorLog, getStringError, mapError, getToken } = require('@src/helper');

const { Logger } = require('@src/modules/log');

const { getCrmData, getCompanyStructures } = require('@src/subscribers/crm-gateway/service');

const _getPhysicalAddress = (addresses) => {


  const response = {
    addressString: '',
    cityName: '',
  };

  if (!addresses) return response;

  const address = Array.isArray(addresses) ?
    addresses.find(address => address.type == 'physical' && address.endDate == null) : addresses;

  if (!address) return response;

  Object.assign(response, address);

  const houseNumberAddition = address.houseNumberAddition ? ` ${address.houseNumberAddition},` : ',';

  response.addressString = `${address.streetName} ${address.houseNumber}${houseNumberAddition} ${address.postalCode} ${address.cityName}`;

  return response;

};

const _getPersonContact = (personContacts, customerContacts, type) => {

  let contact = '';

  contact = personContacts.find(contact => contact.type === type && contact.customerId && contact.personId);

  if (contact) return contact.value;

  contact = customerContacts.find(contact => contact.type === type && !contact.personId);

  return contact.value;
};

const createSingleContractParty = async (headerToken, smeLoanRequest, crmData, contractPartySequenceNumber) => {

  const stakeholders = crmData.stakeholders;

  const customer = crmData.customer.customer;

  for (let i = 0; i < stakeholders.length; i++) {

    const stakeholder = stakeholders[i];

    const person = stakeholder.person.person;

    const contractParty = {
      contractId: smeLoanRequest.contractId,
      contractPartySequenceNumber: contractPartySequenceNumber,
      customerId: customer.id,
      customerLegalName: customer.legalName,
      customerAddress: _getPhysicalAddress(crmData.customer.physicalAddress).addressString,
      customerCity: _getPhysicalAddress(crmData.customer.physicalAddress).cityName,
      customerCocId: customer.cocId ? customer.cocId : '',
      dataProviderId: customer.dataProviderId ? customer.dataProviderId : '',
      personId: person.id,
      personContractName: person.contractName,
      personChristianName: person.christianName,
      personBirthDate: person.birthDate,
      personCityOfBirth	: person.cityOfBirth,
      personAddress: _getPhysicalAddress(stakeholder.person.address).addressString,
      personCity: _getPhysicalAddress(crmData.customer.physicalAddress).cityName,
      personPhoneNumber: _getPersonContact(stakeholder.person.contact, crmData.customer.contact, 'phone'),
      personEmailAddress: _getPersonContact(stakeholder.person.contact, crmData.customer.contact, 'email'),
      signContractIndicator: stakeholder.signingContractIndicator == 'yes' ? 'signature-required' : 'not-applicable',
      signGuarantee: stakeholder.signingGuaranteeIndicator == 'yes' ? 'signature-required' : 'not-applicable',
      partnerContractName: person.contractNamePartner,
      partnerPhone: person.phonePartner,
      partnerEmail: person.emailPartner
    };

    const [err] = await to(Service.createContractParty(contractParty, headerToken));

    if (err) {
      const error = { error: err };
      Error.captureStackTrace(error);
      TE(error);
    }

    contractPartySequenceNumber++;
  }

  return contractPartySequenceNumber;
};

const createMotherCompanyContractParties = async (customer, smeLoanRequest, headerToken, contractPartySequenceNumber) => {

  const customerMongoId = customer._id;

  const [err, motherCompanyStructures] = await to(getCompanyStructures({ customerIdDaughter: customerMongoId}));

  if(err) {
    const error = { error: err };
    Error.captureStackTrace(error);
    TE(error);
  }

  const filteredMotherCompanyStructures = motherCompanyStructures.filter(motherCompanyStructure => !motherCompanyStructure.endDate);

  if (filteredMotherCompanyStructures.length == 0) return contractPartySequenceNumber;

  for (let i = 0; i < filteredMotherCompanyStructures.length; i++) {

    const companyStructure = filteredMotherCompanyStructures[i];

    if (companyStructure.boardMemberIndicator == 'yes') {

      const crmData = await getCrmData({ mongoId: companyStructure.customerIdMother }, headerToken);

      contractPartySequenceNumber = await createSingleContractParty(headerToken, smeLoanRequest, crmData, contractPartySequenceNumber);

      customer = crmData.customer.customer;

      await createMotherCompanyContractParties(customer, smeLoanRequest, headerToken, contractPartySequenceNumber);
    }
  }

  return contractPartySequenceNumber;
};

const createSisterCompanyContractParties = async (customer, smeLoanRequest, headerToken, contractPartySequenceNumber) => {

  const customerMongoId = customer._id;

  const [err, motherCompanyStructures] = await to(getCompanyStructures({ customerIdDaughter: customerMongoId}));

  if(err) {
    const error = { error: err };
    Error.captureStackTrace(error);
    TE(error);
  }

  const filteredMotherCompanyStructures = motherCompanyStructures.filter(motherCompanyStructure => !motherCompanyStructure.endDate);

  if (filteredMotherCompanyStructures.length == 0) return;

  for (let i = 0; i < filteredMotherCompanyStructures.length; i++) {

    const motherCompanyStructure = filteredMotherCompanyStructures[i];

    const [err, daughterCompanyStructures] = await to(getCompanyStructures({ customerIdMother: motherCompanyStructure.customerIdMother }));

    if(err) {
      const error = { error: err };
      Error.captureStackTrace(error);
      TE(error);
    }

    const filteredDaughterCompanyStructures = daughterCompanyStructures.filter(daughterCompanyStructure => !daughterCompanyStructure.endDate);

    if (filteredDaughterCompanyStructures.length == 0) return;

    for (let j = 0; j < filteredDaughterCompanyStructures.length; j++) {

      const daughterCompanyStructure = filteredDaughterCompanyStructures[j];

      if (daughterCompanyStructure.customerIdDaughter === customerMongoId) continue;

      const crmData = await getCrmData({ mongoId: daughterCompanyStructure.customerIdDaughter }, headerToken);

      contractPartySequenceNumber = await createSingleContractParty(headerToken, smeLoanRequest, crmData, contractPartySequenceNumber);
    }
  }

  return;
};

const createContractParty = async ({ task, taskService }) => {

  const variables = new Variables();

  const errorLog = getErrorLog(task);

  const { smeLoanRequest, crmData } = task.variables.getAll();

  const ERROR = 'CONTRACT_PARTY create failed';

  try {

    let contractPartySequenceNumber = 1;

    contractPartySequenceNumber = await createSingleContractParty(getToken(task), smeLoanRequest, crmData, contractPartySequenceNumber);

    variables.set('contractPartySequenceNumber', contractPartySequenceNumber);

    variables.set(task.executionId, {
      success: true
    });

    await taskService.complete(task, variables);

  } catch (error) {

    const errorStack = mapError(error, ERROR);

    Logger.error({
      module: 'CONTRACT_PARTY',
      logData: {
        errorStack: errorStack,
        infoStack: mapTask(task)
      }
    });

    variables.set(task.executionId, {
      success: false,
      errorStack: errorStack
    });

    const strError = getStringError(errorStack.error);

    errorLog.push(strError);

    await taskService.handleBpmnError(
      task,
      'ERROR_CREATE_CONTRACT_PARTY',
      ERROR,
      variables
    );
  }
};

const createOtherContractParties = async ({ task, taskService }) => {

  const variables = new Variables();

  const errorLog = getErrorLog(task);

  const ERROR = 'OTHER-COUNTER-PARTIES failed';

  const { crmData, smeLoanRequest, contractPartySequenceNumber } = task.variables.getAll();

  const headerToken = getToken(task);

  try {

    const customer = crmData.customer.customer;

    const sequenceNumber = await createMotherCompanyContractParties(customer, smeLoanRequest, headerToken, contractPartySequenceNumber);

    await createSisterCompanyContractParties(customer, smeLoanRequest, headerToken, sequenceNumber);

    variables.set(task.executionId, {
      success: true
    });

    await taskService.complete(task, variables);

  } catch (error) {

    const errorStack = mapError(error, ERROR);

    Logger.error({
      module: 'CONTRACT_PARTY',
      logData: {
        errorStack: errorStack,
        infoStack: mapTask(task)
      }
    });

    variables.set(task.executionId, {
      success: false,
      errorStack: errorStack
    });

    const strError = getStringError(errorStack.error);

    errorLog.push(strError);

    variables.set('errorLog', errorLog);

    await taskService.handleBpmnError(
      task,
      'ERROR_CREATE_OTHER_CONTRACT_PARTY',
      ERROR,
      variables
    );
  }
};

module.exports = {
  createContractParty,

  createOtherContractParties
};