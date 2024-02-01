const { Variables,
  // logger 
} = require('camunda-external-task-client-js');

const Service = require('./service');

const AddressService = require('../crm-management/address/service');

const ContactService = require('../crm-management/contact/service');

const CustomerService = require('../crm-management/customer/service');

const PersonService = require('../crm-management/person/service');

const Mapper = require('./mapper');

const { CustomerProps, PersonProps } = require('./constants');

const { AWSService } = require('../../services');

const { SQSService } = AWSService;

const { Config } = require('../../../config');

const { updateCrmSystemQueue } = Config.AWS_CONFIGS;

const { handleError } = require('../subscribers-helper');

const {
  to,
  TE,
  getErrorLog,
  getStringError,
  mapTask,
  mapError,
  getToken,
  getProcessIdentifiers
} = require('@src/helper');

const { Logger } = require('@src/modules/log');

const _mapError = (component, message, errors) => ({
  component: component,
  message: message,
  errors: errors
});

const _getErrors = (errors) => {

  const errorLog = [];

  errors && Object.keys(errors).filter( (key) => {

    const value = errors[key];

    if(value && value.length > 0){
      const message = `${key} update failed; check ${key} yourself`;
      errorLog.push(_mapError(key, message, value));
    }
  });

  return errorLog;
};

const _checkCustomerAddress = async (address, newAddress, headerToken) => {

  try{
    const addressesToUpdate = [];
    const addressesToDelete = [];

    //  if address doesn't exist push to addresses list (make 'isPreferred' true)
    if (address.length <= 0) {
      newAddress.isPreferred = true;
      addressesToUpdate.push(newAddress);
    }
    // if addresses already exists, compare each address with the v-tiger data
    if (address.length > 0) {

      const addressFromVTiger = mapAddressForComparison(newAddress);
      // let addressFound = false 
      address.forEach(addressObject => {

        const addressToBeCompared = mapAddressForComparison(addressObject);
        // const keysFound = [];
        // check if the current address are different compares to vTiger address
        Object.keys(addressFromVTiger).forEach(key => {
          if (addressFromVTiger[key] !== addressToBeCompared[key]) {
            // keysFound.push(key);
            addressesToDelete.push(addressObject._id);
          }
        });

        /**
         * Removed with TF-1130
        if(keysFound.length == 0){
          addressFound = true;
        }
        // if address is found and if 'isPreferred' is false update address as the preferred address
        if (keysFound.length == 0 && (!addressObject.isPreferred || addressObject.isPreferred != true)){
          addressObject.isPreferred = true;
          addressObject.action = 'update';
          addressesToUpdate.push(addressObject);
        }
        // if previously preferred address is found, make 'isPreferred' false and push v-tiger address to list
        if (keysFound.length > 0 && (addressObject.isPreferred || addressObject.isPreferred == true)){
          addressObject.isPreferred = false;
          addressObject.action = 'update';
          addressesToUpdate.push(addressObject);
        }
         */

      });

      /**
       * Removed with TF-1130
      if(!addressFound){
        newAddress.isPreferred = true;
        addressesToUpdate.push(newAddress);
      }
      */

      /** 
     * if the current address is different then all the addresses are deleted
     * create a new address record 
     */

      const uniqueValues = [...new Set(addressesToDelete)];

      if (uniqueValues.length > 0 && address.length === uniqueValues.length) {

        const addressDeleteRequestBody = { ids: uniqueValues };

        await AddressService.deleteAddress(addressDeleteRequestBody, headerToken);

        newAddress.isPreferred = true;
        addressesToUpdate.push(newAddress);

      } else if (uniqueValues.length > 0 && address.length !== uniqueValues.length) {

        const addressDeleteRequestBody = { ids: uniqueValues };

        await AddressService.deleteAddress(addressDeleteRequestBody, headerToken);

      }

    }
    if (addressesToUpdate.length > 0) {
      const requestBody = {
        customerId: newAddress.customerId ? newAddress.customerId : undefined,
        personId: newAddress.personId ? newAddress.personId : undefined,
        addresses: addressesToUpdate
      };
      await AddressService.updateAddress(requestBody, headerToken);
      return [];
    }
    return ['Customer address exist already. no updates made'];
  } catch (err) {
    const error = { error: err };
    Error.captureStackTrace(error);
    TE(error);
  }
};

const _checkPersonAddress = async (address, newAddress, headerToken) => {

  try {
    const addressesToUpdate = [];
    const addressesToDelete = [];

    //  if address doesn't exist push to addresses list (make 'isPreferred' true)
    if (address.length <= 0) {
      newAddress.isPreferred = true;
      addressesToUpdate.push(newAddress);
    }
    // if addresses already exists, compare each address with the v-tiger data
    if (address.length > 0) {
      const addressFromVTiger = mapAddressForComparison(newAddress);

      address.forEach(addressObject => {

        const addressToBeCompared = mapAddressForComparison(addressObject);

        // check if the current address is different compares to vTiger address
        Object.keys(addressFromVTiger).forEach(key => {
          if (addressFromVTiger[key] !== addressToBeCompared[key]) {
            addressesToDelete.push(addressObject._id);
          }
        });

        /** Removed with TF-1130
         * 
          // if address is found and if 'isPreferred' is false update address as the preferred address
          if (keysFound.length == 0 && (!addressObject.isPreferred || addressObject.isPreferred != true)) {
            addressObject.isPreferred = true;
            addressObject.action = 'update';
            addressesToUpdate.push(addressObject);
          }
          // if previously preferred address is found, make 'isPreferred' false and push v-tiger address to list
          if (keysFound.length > 0 && (addressObject.isPreferred || addressObject.isPreferred == true)) {
            addressObject.isPreferred = false;
            addressObject.action = 'update';
            addressesToUpdate.push(addressObject);
          } 
        */

      });

      /** Removed with TF-1130
         * 
          if (!addressFound) {
            newAddress.isPreferred = true;
            addressesToUpdate.push(newAddress);
          }
       */

      /** 
       * if the current address is different then all the addresses are deleted
       * create a new address record 
       */

      const uniqueValues = [...new Set(addressesToDelete)];

      if (uniqueValues.length > 0 && address.length === uniqueValues.length) {

        const addressDeleteRequestBody = { ids: uniqueValues };

        await AddressService.deleteAddress(addressDeleteRequestBody, headerToken);

        newAddress.isPreferred = true;
        addressesToUpdate.push(newAddress);

      } else if (uniqueValues.length > 0 && address.length !== uniqueValues.length) {

        const addressDeleteRequestBody = { ids: uniqueValues };

        await AddressService.deleteAddress(addressDeleteRequestBody, headerToken);

      }

    }

    if (addressesToUpdate.length > 0) {

      const requestBody = {
        customerId: newAddress.customerId ? newAddress.customerId : undefined,
        personId: newAddress.personId ? newAddress.personId : undefined,
        addresses: addressesToUpdate
      };

      await AddressService.updateAddress(requestBody, headerToken);
      return [];
    }

    return ['Person address exist already. no updates made'];

  } catch (err) {
    const error = { error: err };
    Error.captureStackTrace(error);
    TE(error);
  }
};

const mapAddressForComparison = ({ streetName, houseNumber, postalCode, cityName, country }) => ({
  streetName,
  houseNumber,
  postalCode,
  cityName,
  country
});

const _checkAndUpdateContacts = async (contactList, values, headerToken) => {

  let newContactList = [];
  const contactsToDelete = [];

  const remarks = [];

  const relatedUser = values.customerId ? 'Customer': 'Person';

  const updatedEmailList = returnEmailListToBeUpdated(contactList, values);


  if (updatedEmailList.length > 0) {
    newContactList = newContactList.concat(updatedEmailList);

    contactList.forEach(contact => {
      if (contact.type === 'email' && contact.subType == 'work') {
        contactsToDelete.push(contact._id);
      }
    });

  } else {
    remarks.push(`${relatedUser} contact(email) exist already. no updates made`);
  }

  const updatedPhoneNumbersList = returnPhoneNumbersListToBeUpdated(contactList, values);

  if (updatedPhoneNumbersList.length > 0) {
    newContactList = newContactList.concat(updatedPhoneNumbersList);

    contactList.forEach(contact => {
      if (contact.type === 'phone' && contact.subType == 'work') {
        contactsToDelete.push(contact._id);
      }
    });

  } else {
    remarks.push(`${relatedUser} Contact(phone) exist already. no updates made`);
  }

  const requestBody = {
    customerId: values.customerId ? values.customerId : undefined,
    personId: values.personId ? values.personId : undefined,
    contacts: newContactList
  };

  const contactsRequestBody = {
    ids: contactsToDelete
  };

  try {

    if (contactsToDelete.length > 0) {

      await ContactService.deleteContacts(contactsRequestBody, headerToken);
    }

    if (newContactList.length > 0) {

      await ContactService.cudContact(requestBody, headerToken);
    }

    return remarks;
  } catch (err) {
    const error = { error: err };
    Error.captureStackTrace(error);
    TE(error);
  }
};

const returnEmailListToBeUpdated = (contactList, values) => {

  const emailList = [];

  const { mapper } = values;

  const emailContactObject = contactList.find(contact => contact.type === 'email' && contact.value === values.email);

  const previouslyPreferredEmailObject = contactList.find(contact => contact.type === 'email' && contact.value != values.email && contact.isPreferred === true );

  //  if email address doesn't exist push to contact list (make 'isPreferred' true)
  if (!emailContactObject){
    emailList.push({
      ...mapper.mapContact({ type: 'email', value: values.email }),
      customerId: values.customerId ? values.customerId : undefined,
      personId: values.personId ? values.personId : undefined,
      isPreferred: true,
      action: 'create',
    });
  }
  //  if email exists and if 'isPreferred' is false update email as the preferred email
  if (emailContactObject && (!emailContactObject.isPreferred || emailContactObject.isPreferred != true)){
    emailList.push({
      ...mapper.mapContact({ type: 'email', value: values.email }),
      customerId: values.customerId ? values.customerId : undefined,
      personId: values.personId ? values.personId : undefined,
      isPreferred: true,
      action: 'update',
    });
  }
  //  if previously preferred email is found, make 'isPreferred' false
  if (previouslyPreferredEmailObject){
    emailList.push({
      _id: previouslyPreferredEmailObject._id,
      type: 'email',
      value: previouslyPreferredEmailObject.value,
      customerId: values.customerId ? values.customerId : undefined,
      personId: values.personId ? values.personId : undefined,
      isPreferred: false,
      action: 'update'
    });
  }

  return emailList;
};

const returnPhoneNumbersListToBeUpdated = (contactList, values) => {

  const phoneNumbersList = [];

  const { mapper } = values;

  const phoneContactObject = contactList.find(contact => contact.type === 'phone' && contact.value === values.phone );

  const previouslyPreferredContactObject = contactList.find(contact => contact.type === 'phone' && contact.value != values.phone && contact.isPreferred === true );

  //  if phone number doesn't exist push to contact list (make 'isPreferred' true)
  if (!phoneContactObject){
    phoneNumbersList.push({
      ...mapper.mapContact({ type: 'phone', value: values.phone }),
      customerId: values.customerId ? values.customerId : undefined,
      personId: values.personId ? values.personId : undefined,
      isPreferred: true,
      action: 'create',
    });
  }
  //  if phone number exists and if 'isPreferred' is false, update phone number as the preferred phone number
  if (phoneContactObject && (!phoneContactObject.isPreferred || phoneContactObject.isPreferred != true)){
    phoneNumbersList.push({
      ...mapper.mapContact({ type: 'phone', value: values.phone }),
      customerId: values.customerId ? values.customerId : undefined,
      personId: values.personId ? values.personId : undefined,
      isPreferred: true,
      action: 'update',
    });
  }
  //  if previously preferred contact is found, make 'isPreferred' false
  if (previouslyPreferredContactObject){
    phoneNumbersList.push({
      _id: previouslyPreferredContactObject._id,
      type: 'phone',
      value: previouslyPreferredContactObject.value,
      customerId: values.customerId ? values.customerId : undefined,
      personId: values.personId ? values.personId : undefined,
      isPreferred: false,
      action: 'update'
    });
  }

  return phoneNumbersList;
};

const updateCustomer = async ({ task, taskService }) => {

  const variables = new Variables();

  let { customerData } = task.variables.getAll();

  const { organization, dataSource } = task.variables.getAll();

  const errorLog = getErrorLog(task);

  const proIdentifiers = getProcessIdentifiers(task);

  const ERROR = 'Customer update failed; check customer-information yourself';

  const remarks = [];

  try {

    customerData = customerData || organization;
    
    const mapper = Mapper(dataSource);

    const customerInput = mapper.mapUpdateCustomer(customerData);

    const { vTigerAccountNumber } = customerInput.customer;

    const params = { vTigerAccountNumber };

    // const { cocId, dataProviderId } = customerInput.customer;

    // const params = cocId ? { cocId } : { dataProviderId };

    const [err, existsCustomerData] = await to(Service
      .getCustomerAddressesContacts(params, getToken(task)));

    if (err) {
      const error = { error: err };
      Error.captureStackTrace(error);
      TE(error);
    }

    let customer = {};

    if (existsCustomerData.customer) {

      customer = existsCustomerData.customer;

      const updatedPropertyObject = {};

      const propertiesToCheck = CustomerProps;

      propertiesToCheck.forEach(property => {
        if (customerInput.customer[property] !== customer[property]) {
          updatedPropertyObject[property] = customerInput.customer[property];
        }
      });

      if (Object.keys(updatedPropertyObject).length > 0) {
        const requestBody = {
          action: 'update',
          _id: customer._id,
          ...updatedPropertyObject
        };

        // Sync customer data with crm-database 
        await CustomerService.cudCustomer(requestBody, getToken(task));
        remarks.push('Update primary contact');

      } else {
        remarks.push('Customer exist already. no updates made');
      }

      const address = existsCustomerData.address;

      if (dataSource === 'v-tiger') {
        const addressRemarks = await _checkCustomerAddress(address, {
          ...mapper.mapAddress(customerData),
          customerId: customer._id
        }, getToken(task));

        remarks.push(...addressRemarks);

      }

      const contactList = existsCustomerData.contact;

      const contactRemarks = await _checkAndUpdateContacts(contactList, {
        mapper: mapper,
        email: customerData.email1,
        phone: customerData.phone,
        customerId: customer._id
      }, getToken(task));

      remarks.push(...contactRemarks);

    } else {

      const [err, result] = await to(Service
        .updateCustomer(customerInput, getToken(task)));

      if (err) {
        const error = { error: err };
        Error.captureStackTrace(error);
        TE(error);
      }

      const { errors } = result;

      customer = result.customer;

      const errorLog = _getErrors(errors);

      if (errorLog.length > 0) {
        const error = { error: errorLog };
        Error.captureStackTrace(error);
        TE(error);
      }
    }

    proIdentifiers.customerId = customer.id;

    variables.set('processIdentifiers', proIdentifiers);

    variables.set('updateCustomer', {
      id: customer.id,
      sysId: customer._id,
      primarySbiCode: customer.primarySbiCode,
      legalName: customer.legalName,
      primaryCustomerSuccessManager: customer.primaryCustomerSuccessManager,
      vTigerAccountNumber: customer.vTigerAccountNumber
    });

    variables.set('customerLegalName', customer.legalName);

    variables.set('remarks', remarks);

    variables.set(task.executionId, {
      success: true
    });

    await taskService.complete(task, variables);

  } catch (error) {

    const errorStack = mapError(error, ERROR);

    Logger.error({
      module: 'CRM',
      logData: {
        errorStack: errorStack,
        infoStack: mapTask(task)
      }
    });

    variables.set(task.executionId, {
      success: false,
      errorStack: errorStack
    });

    errorLog.push(ERROR);

    variables.set('errorLog', errorLog);

    await taskService.handleBpmnError(
      task,
      'ERROR_UPDATE_CUSTOMER',
      ERROR,
      variables
    );
  }
};

const updatePerson = async ({ task, taskService }) => {

  const variables = new Variables();

  const { personData, dataSource, updateCustomer } = task.variables.getAll();

  const errorLog = getErrorLog(task);

  const ERROR = 'Update of PERSON failed; check PERSON-information yourself';

  const remarks = task.variables.get('remarks');

  try {

    const mapper = Mapper(dataSource);

    const [stakeholderErr, stakeholders] = await to(Service
      .getStakeholders(updateCustomer.sysId, getToken(task)));

    if (stakeholderErr) {
      const error = { error: stakeholderErr };
      Error.captureStackTrace(error);
      TE(error);
    }

    if (stakeholders.length > 0) {

      const stakeholder = stakeholders[0];

      const updateStakeholders = [{
        id: stakeholder.id,
        sysId: stakeholder._id
      }];

      const updatePerson = {
        id: '',
        sysId: stakeholder.personId
      };

      remarks.push('Stakeholder exist already. no updates made');

      const [errPrefix, namePrefixes] = await to(Service.getNamePrefixes(getToken(task)));

      if (errPrefix) TE(errPrefix);

      const personInput = mapper.mapUpdatePerson(personData, namePrefixes);

      if (updatePerson.sysId) {
        const [personErr, persons] = await to(Service
          .getPersonDetails({ _id: updatePerson.sysId }, getToken(task)));

        if (personErr) {
          const error = { error: personErr };
          Error.captureStackTrace(error);
          TE(error);
        }

        if (persons && persons.length > 0) {
          const person = persons[0];

          const existsPersonData = await to(Service
            .getPersonAddressesContacts({ personId: person.id }, getToken(task)));

          if (person) {

            updatePerson.id = person.id;

            remarks.push('Person exist already. no updates made');

            // Get contacts
            const [contactErr, contacts] = await to(Service.getContacts({
              personId: updatePerson.sysId
            }, getToken(task)));

            if (contactErr) {
              const error = { error: contactErr };
              Error.captureStackTrace(error);
              TE(error);
            }

            const updatedPropertyObject = {};

            const propertiesToCheck = PersonProps;

            propertiesToCheck.forEach(property => {
              if (personInput.person[property] !== person[property]) {
                updatedPropertyObject[property] = personInput.person[property];
              }
            });

            if (Object.keys(updatedPropertyObject).length > 0) {
              const requestBody = {
                action: 'update',
                _id: person._id,
                ...updatedPropertyObject
              };

              // Sync person data with crm-database
              await PersonService.cudPerson(requestBody, getToken(task));

            }

            const address = existsPersonData[1].address;
            const currentAddress = (address !== undefined || address.length > 0) ? address : [];

            if (dataSource === 'v-tiger') {
              const addressRemarks = await _checkPersonAddress(currentAddress, {
                ...mapper.mapContactAddress(personData),
                personId: person._id
              }, getToken(task));

              remarks.push(...addressRemarks);
            }

            const contactsRemarks = await _checkAndUpdateContacts(contacts, {
              mapper: mapper,
              email: personData.email,
              phone: personData.phone,
              personId: updatePerson.sysId
            });

            remarks.push(...contactsRemarks);
          }
        }
      }

      variables.set('updateStakeholders', updateStakeholders);

      variables.set('updatePerson', updatePerson);

    } else {

      const [errPrefix, namePrefixes] = await to(Service.getNamePrefixes(getToken(task)));

      if (errPrefix) TE(errPrefix);

      const personInput = mapper.mapUpdatePerson(personData, namePrefixes);

      const [err, result] = await to(Service
        .updatePerson(personInput, getToken(task)));

      if (err) {
        const error = { error: err };
        Error.captureStackTrace(error);
        TE(error);
      }

      const { errors, person } = result;

      const errorLog = _getErrors(errors);

      if (errorLog.length > 0) {
        const error = { error: errorLog };
        Error.captureStackTrace(error);
        TE(error);
      }

      variables.set('updatePerson', {
        id: person.id,
        sysId: person._id
      });
    }

    variables.set('remarks', remarks);

    variables.set(task.executionId, {
      success: true
    });

    await taskService.complete(task, variables);

  } catch (error) {

    const errorStack = mapError(error, ERROR);

    Logger.error({
      module: 'CRM',
      logData: {
        errorStack: errorStack,
        infoStack: mapTask(task)
      }
    });

    variables.set(task.executionId, {
      success: false,
      errorStack: errorStack
    });

    errorLog.push(ERROR);

    variables.set('errorLog', errorLog);

    await taskService.handleBpmnError(
      task,
      'ERROR_UPDATE_PERSON',
      ERROR,
      variables
    );
  }
};

const updateStakeholder = async ({ task, taskService }) => {

  const variables = new Variables();

  const errorLog = getErrorLog(task);

  const { updateCustomer, updatePerson, updateStakeholders, dataSource } = task.variables.getAll();

  const ERROR = 'STAKEHOLDER update failed; please check STAKEHOLDER relationships yourself';

  try {

    if (!updateStakeholders || updateStakeholders.length <= 0) {

      if (!updateCustomer) {
        const error = { error: 'customer-id is required' };
        Error.captureStackTrace(error);
        TE(error);
      }

      if (!updatePerson) {
        const error = { error: 'person-id is required' };
        Error.captureStackTrace(error);
        TE(error);
      }

      const stakeholderInput = Mapper(dataSource)
        .mapStakeholder(updateCustomer.sysId, updatePerson.sysId);

      const [err, result] = await to(Service
        .updateStakeholder([stakeholderInput], getToken(task)));

      if (err) {
        const error = { error: err };
        Error.captureStackTrace(error);
        TE(error);
      }

      const { errors, stakeholders } = result;

      const errorLog = _getErrors(errors);

      if (errorLog.length > 0) {
        const error = { error: errorLog };
        Error.captureStackTrace(error);
        TE(error);
      }

      const updateStakeholders = stakeholders.map(stakeholder => ({
        id: stakeholder.id,
        sysId: stakeholder._id
      }));

      variables.set('updateStakeholders', updateStakeholders);
    }

    variables.set(`SUCCESS_${task.topicName}`, true);

    await taskService.complete(task, variables);

  } catch (error) {

    const errorStack = mapError(error, ERROR);

    Logger.error({
      module: 'CRM',
      logData: {
        errorStack: errorStack,
        infoStack: mapTask(task)
      }
    });

    variables.set(task.executionId, {
      success: false,
      errorStack: errorStack
    });

    errorLog.push(ERROR);

    variables.set('errorLog', errorLog);

    await taskService.handleBpmnError(
      task,
      'ERROR_UPDATE_STAKEHOLDER',
      ERROR,
      variables
    );
  }
};

const getCrmData = async ({ task, taskService }) => {

  const variables = new Variables();

  const errorLog = getErrorLog(task);

  const { smeLoanRequest } = task.variables.getAll();

  const ERROR = 'CRM data get failed; please check yourself';

  try {
    const crmData = await Service.getCrmData({ customerId: smeLoanRequest.customerId }, getToken(task));

    const customerLegalForm = crmData.customer.customer.legalForm;

    variables.set('updateCustomer', {
      id: crmData.customer.customer.id,
      sysId: crmData.customer.customer._id,
      primarySbiCode: crmData.customer.customer.primarySbiCode,
      legalName: crmData.customer.customer.legalName,
      primaryCustomerSuccessManager: crmData.customer.customer.primaryCustomerSuccessManager,
      vTigerAccountNumber: crmData.customer.customer.vTigerAccountNumber
    });

    variables.set('customerLegalForm', customerLegalForm);

    variables.set('crmData', crmData);

    await taskService.complete(task, variables);

  } catch (error) {

    const errorStack = mapError(error, ERROR);

    Logger.error({
      module: 'CRM',
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
      'ERROR_GET_CRM_DATA',
      ERROR,
      variables
    );
  }
};

const getCustomerDetail = async ({ task, taskService }) => {

  const variables = new Variables();

  // const errorLog = getErrorLog(task);

  const { organization } = task.variables.getAll();

  // const ERROR = 'CRM customer detail data get failed; please check yourself';

  // try {

  // const [err, customerData] = await to(Service
  //   .getCustomerDetails({ legalName: organization.accountname }, getToken(task)));

  // if(err) {
  //   const error = { error: err };
  //   Error.captureStackTrace(error);     
  //   TE(error);
  // }

  // let isExistsCustomerInCRM = false;

  // if(customerData.customer){

  //   const updatePerson = {};

  //   const updateStakeholders = [];

  //   const [stakeholderErr, stakeholders] = await to(Service
  //     .getStakeholders(customerData.customer._id, getToken(task)));

  //   if(stakeholderErr) {
  //     const error = { error: stakeholderErr };
  //     Error.captureStackTrace(error);     
  //     TE(error);
  //   }

  //   const stakeholder = stakeholders
  //     .find( stakeholder => stakeholder.role === 'Managing Director');

  //   if(!stakeholder) {
  //     // const error = { error: 'Not found stakeholder role as Managing Director' };
  //     // Error.captureStackTrace(error);     
  //     // TE(error);
  //     isExistsCustomerInCRM = false;
  //   }

  //   variables.set('updateCustomer', {
  //     id: customerData.customer.id,
  //     sysId: customerData.customer._id,
  //     primarySbiCode: customerData.customer.primarySbiCode,
  //     legalName: customerData.customer.legalName,
  //     primaryCustomerSuccessManager: customerData.customer.primaryCustomerSuccessManager,
  //     vTigerAccountNumber: customerData.customer.vTigerAccountNumber
  //   });

  //   updatePerson.id = '';
  //   updatePerson.sysId = stakeholder.personId;
  //   updateStakeholders.push({
  //     id: stakeholder.id,
  //     sysId: stakeholder._id
  //   });

  //   if(updatePerson.sysId){
  //     const [personErr, persons] = await to(Service
  //       .getPersonDetails({_id: updatePerson.sysId }, getToken(task)));

  //     if(personErr) {
  //       const error = { error: personErr };
  //       Error.captureStackTrace(error);     
  //       TE(error);
  //     }

  //     if(persons && persons.length > 0){
  //       const person = persons[0];
  //       updatePerson.id = person.id;
  //     }
  //   }

  //   isExistsCustomerInCRM = true;
  //   variables.set('remark', ['Customer exist already. no updates made']);

  //   variables.set('updatePerson', updatePerson);

  //   variables.set('updateStakeholders', updateStakeholders);
  // }

  variables.set('isExistsCustomerInCRM', false);

  variables.set('customerLegalName', organization.accountname);

  // variables.set('errorLog', errorLog);

  await taskService.complete(task, variables);

  // } catch (error) {

  //   const errorStack = mapError(error, ERROR);

  //   Logger.error({
  //     module: 'CRM',
  //     logData: {
  //       errorStack: errorStack,
  //       infoStack: mapTask(task)
  //     }
  //   });

  //   variables.set(task.executionId, {
  //     success: false,
  //     errorStack: errorStack
  //   });

  //   const strError = getStringError(errorStack.error);

  //   errorLog.push(strError);

  //   variables.set('errorLog', errorLog);

  //   await taskService.handleBpmnError(
  //     task,
  //     'ERROR_GET_CRM_DATA',
  //     ERROR,
  //     variables
  //   );
  // }
};

const prepareUpdateCrmInitiation = async ({ task, taskService }) => {

  let variables = new Variables();

  const {
    chamberOfCommerceProfile,
    vtigerCrmEntities,
    customerContact,
    dataProviderId,
    personData,
  } = task.variables.getAll();

  const processIdentifiers = getProcessIdentifiers(task);

  const ERROR = 'PREPARE_CRM_SYSTEM_INITIATION error occurred';

  try {
    const customerData = {
      chamberOfCommerceProfile: chamberOfCommerceProfile,
      vtigerCrmEntities: vtigerCrmEntities,
      customerContact: customerContact,
      dataProviderId: dataProviderId,
    };

    const { businessKey, processDefinitionKey } = task;

    await SQSService.sendMessage(
      {
        customerData,
        dataSource: 'data-provider',
        smeLoanRequestId: businessKey,
        processDefinitionKey,
        personData,
        processIdentifiers,
      },
      updateCrmSystemQueue
    );

    variables.set('mainProcessDefinitionKey', processDefinitionKey);

    variables.set(`SUCCESS_${task.topicName}`, true);

    await taskService.complete(task, variables);
  } catch (error) {

    variables = handleError(task, variables, 'CRM', error, { bpmnErrorMessage: ERROR }, { isLogger: false });

    await taskService.handleBpmnError(
      task,
      'PREPARE_CRM_SYSTEM_INITIATION',
      ERROR,
      variables
    );
  }
};

module.exports = {

  updateCustomer,

  updatePerson,

  updateStakeholder,

  getCrmData,

  getCustomerDetail,

  prepareUpdateCrmInitiation
};