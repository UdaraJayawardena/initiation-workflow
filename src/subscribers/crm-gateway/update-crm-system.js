const Service = require('./service');

const { AWSService } = require('../../services');

const { SQSService } = AWSService;

const AddressService = require('../crm-management/address/service');

const ContactService = require('../crm-management/contact/service');

const CustomerService = require('../crm-management/customer/service');

const Mapper = require('./mapper');

const { Config } = require('../../../config');

const { completeTaskQueueUrl } = Config.AWS_CONFIGS;

const { to, TE, mapError } = require('@src/helper');

const _mapError = (component, message, errors) => ({
  component: component,
  message: message,
  errors: errors,
});

const _getErrors = (errors) => {
  const errorLog = [];

  errors &&
    Object.keys(errors).filter((key) => {
      const value = errors[key];

      if (value && value.length > 0) {
        const message = `${key} update failed; check ${key} yourself`;
        errorLog.push(_mapError(key, message, value));
      }
    });

  return errorLog;
};

const _checkCustomerAddress = async (address, newAddress, headerToken) => {
  try {
    const addressesToUpdate = [];

    //  if address doesn't exist push to addresses list (make 'isPreferred' true)
    if (address.length <= 0) {
      newAddress.isPreferred = true;
      addressesToUpdate.push(newAddress);
    }
    // if addresses already exists, compare each address with the v-tiger data
    if (address.length > 0) {
      const addressFromVTiger = mapAddressForComparison(newAddress);
      let addressFound = false;
      address.forEach((addressObject) => {
        const addressToBeCompared = mapAddressForComparison(addressObject);
        const keysFound = [];
        Object.keys(addressFromVTiger).forEach((key) => {
          if (addressFromVTiger[key] !== addressToBeCompared[key]) {
            keysFound.push(key);
          }
        });
        if (keysFound.length == 0) {
          addressFound = true;
        }
        // if address is found and if 'isPreferred' is false update address as the preferred address
        if (keysFound.length == 0 && !addressObject.isPreferred) {
          addressObject.isPreferred = true;
          addressObject.action = 'update';
          addressesToUpdate.push(addressObject);
        }
        // if previously preferred address is found, make 'isPreferred' false and push v-tiger address to list
        if (keysFound.length > 0 && addressObject.isPreferred) {
          addressObject.isPreferred = false;
          addressObject.action = 'update';
          addressesToUpdate.push(addressObject);
        }
      });
      if (!addressFound) {
        newAddress.isPreferred = true;
        addressesToUpdate.push(newAddress);
      }
    }
    if (addressesToUpdate.length > 0) {
      const requestBody = {
        customerId: newAddress.customerId ? newAddress.customerId : undefined,
        personId: newAddress.personId ? newAddress.personId : undefined,
        addresses: addressesToUpdate,
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

const mapAddressForComparison = ({
  streetName,
  houseNumber,
  postalCode,
  cityName,
  country,
}) => ({
  streetName,
  houseNumber,
  postalCode,
  cityName,
  country,
});

const _checkAndUpdateContacts = async (contactList, values, headerToken) => {
  let newContactList = [];

  const remarks = [];

  const relatedUser = values.customerId ? 'Customer' : 'Person';

  const updatedEmailList = returnEmailListToBeUpdated(contactList, values);

  if (updatedEmailList.length > 0) {
    newContactList = newContactList.concat(updatedEmailList);
  } else {
    remarks.push(
      `${relatedUser} contact(email) exist already. no updates made`
    );
  }

  const updatedPhoneNumbersList = returnPhoneNumbersListToBeUpdated(
    contactList,
    values
  );

  if (updatedPhoneNumbersList.length > 0) {
    newContactList = newContactList.concat(updatedPhoneNumbersList);
  } else {
    remarks.push(
      `${relatedUser} Contact(phone) exist already. no updates made`
    );
  }

  const requestBody = {
    customerId: values.customerId ? values.customerId : undefined,
    personId: values.personId ? values.personId : undefined,
    contacts: newContactList,
  };

  try {
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

  const emailContactObject = contactList.find(
    (contact) => contact.type === 'email' && contact.value === values.email
  );

  const previouslyPreferredEmailObject = contactList.find(
    (contact) =>
      contact.type === 'email' &&
      contact.value != values.email &&
      contact.isPreferred
  );

  //  if email address doesn't exist push to contact list (make 'isPreferred' true)
  if (!emailContactObject) {
    emailList.push({
      ...mapper.mapContact({ type: 'email', value: values.email }),
      customerId: values.customerId ? values.customerId : undefined,
      personId: values.personId ? values.personId : undefined,
      isPreferred: true,
      action: 'create',
    });
  }
  //  if email exists and if 'isPreferred' is false update email as the preferred email
  if (emailContactObject && !emailContactObject.isPreferred) {
    emailList.push({
      ...mapper.mapContact({ type: 'email', value: values.email }),
      customerId: values.customerId ? values.customerId : undefined,
      personId: values.personId ? values.personId : undefined,
      isPreferred: true,
      action: 'update',
    });
  }
  //  if previously preferred email is found, make 'isPreferred' false
  if (previouslyPreferredEmailObject) {
    emailList.push({
      _id: previouslyPreferredEmailObject._id,
      type: 'email',
      value: previouslyPreferredEmailObject.value,
      customerId: values.customerId ? values.customerId : undefined,
      personId: values.personId ? values.personId : undefined,
      isPreferred: false,
      action: 'update',
    });
  }

  return emailList;
};

const returnPhoneNumbersListToBeUpdated = (contactList, values) => {
  const phoneNumbersList = [];

  const { mapper } = values;

  const phoneContactObject = contactList.find(
    (contact) => contact.type === 'phone' && contact.value === values.phone
  );

  const previouslyPreferredContactObject = contactList.find(
    (contact) =>
      contact.type === 'phone' &&
      contact.value != values.phone &&
      contact.isPreferred
  );

  //  if phone number doesn't exist push to contact list (make 'isPreferred' true)
  if (!phoneContactObject) {
    phoneNumbersList.push({
      ...mapper.mapContact({ type: 'phone', value: values.phone }),
      customerId: values.customerId ? values.customerId : undefined,
      personId: values.personId ? values.personId : undefined,
      isPreferred: true,
      action: 'create',
    });
  }
  //  if phone number exists and if 'isPreferred' is false, update phone number as the preferred phone number
  if (phoneContactObject && !phoneContactObject.isPreferred) {
    phoneNumbersList.push({
      ...mapper.mapContact({ type: 'phone', value: values.phone }),
      customerId: values.customerId ? values.customerId : undefined,
      personId: values.personId ? values.personId : undefined,
      isPreferred: true,
      action: 'update',
    });
  }
  //  if previously preferred contact is found, make 'isPreferred' false
  if (previouslyPreferredContactObject) {
    phoneNumbersList.push({
      _id: previouslyPreferredContactObject._id,
      type: 'phone',
      value: previouslyPreferredContactObject.value,
      customerId: values.customerId ? values.customerId : undefined,
      personId: values.personId ? values.personId : undefined,
      isPreferred: false,
      action: 'update',
    });
  }

  return phoneNumbersList;
};

const _updateCustomer = async (data) => {
  const {
    customerData,
    dataSource,
    processIdentifiers,
    smeLoanRequestId,
    processDefinitionKey,
  } = data;

  const remarks = [];

  const ERROR = 'Customer update failed; check customer-information yourself';

  try {
    const mapper = Mapper(dataSource);

    const customerInput = mapper.mapUpdateCustomer(
      JSON.stringify(customerData)
    );

    const { vTigerAccountNumber } = customerInput.customer;

    const params = { vTigerAccountNumber };

    const [err, existsCustomerData] = await to(
      Service.getCustomerAddressesContacts(params)
    );

    if (err) {
      const error = { error: err };
      Error.captureStackTrace(error);
      TE(error);
    }

    let customer = {};

    if (existsCustomerData?.customer) {
      customer = existsCustomerData.customer;

      if (
        customerInput.customer.primaryCustomerSuccessManager !==
        customer.primaryCustomerSuccessManager
      ) {
        const requestBody = {
          action: 'update',
          _id: customer._id,
          primaryCustomerSuccessManager:
            customerInput.customer.primaryCustomerSuccessManager,
        };

        await CustomerService.cudCustomer(requestBody);
        remarks.push('Update primary contact');
      } else {
        remarks.push('Customer exist already. no updates made');
      }

      const address = existsCustomerData.address;

      const addressRemarks = await _checkCustomerAddress(address, {
        ...mapper.mapAddress(customerData?.chamberOfCommerceProfile?.addresses),
        customerId: customer._id,
      });

      remarks.push(...addressRemarks);

      const contactList = existsCustomerData.contact;

      const contactRemarks = await _checkAndUpdateContacts(contactList, {
        mapper: mapper,
        email: customerData.email1,
        phone: customerData.phone,
        customerId: customer._id,
      });

      remarks.push(...contactRemarks);
    } else {
      const [err, result] = await to(Service.updateCustomer(customerInput));

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

    processIdentifiers.customerId = customer.id;

    const updateCustomer = {
      id: customer.id,
      sysId: customer._id,
      primarySbiCode: customer.primarySbiCode,
      legalName: customer.legalName,
      primaryCustomerSuccessManager: customer.primaryCustomerSuccessManager,
      vTigerAccountNumber: customer.vTigerAccountNumber,
    };

    const customerLegalName = customer.legalName;

    return {
      ...data,
      processIdentifiers,
      updateCustomer,
      customerLegalName,
      remarks,
    };
  } catch (error) {
    const errorStack = mapError(error, ERROR);
    console.error(
      `${processDefinitionKey} | _updateCustomer | ${smeLoanRequestId} :`,
      {
        module: 'CRM',
        logData: {
          errorStack: errorStack,
        },
      }
    );

    throw error;
  }
};

const _updatePerson = async (data) => {
  const {
    personData,
    dataSource,
    updateCustomer,
    remarks,
    smeLoanRequestId,
    processDefinitionKey,
  } = data;

  const ERROR = 'Update of PERSON failed; check PERSON-information yourself';

  try {
    const mapper = Mapper(dataSource);

    const [stakeholderErr, stakeholders] = await to(
      Service.getStakeholders(updateCustomer.sysId)
    );

    if (stakeholderErr) {
      const error = { error: stakeholderErr };
      Error.captureStackTrace(error);
      TE(error);
    }

    if (stakeholders && stakeholders.length > 0) {
      const stakeholder = stakeholders[0];

      const updateStakeholders = [
        {
          id: stakeholder.id,
          sysId: stakeholder._id,
        },
      ];

      const updatePerson = {
        id: '',
        sysId: stakeholder.personId,
      };

      remarks.push('Stakeholder exist already. no updates made');

      if (updatePerson.sysId) {
        const [personErr, persons] = await to(
          Service.getPersonDetails({ _id: updatePerson.sysId })
        );

        if (personErr) {
          const error = { error: personErr };
          Error.captureStackTrace(error);
          TE(error);
        }

        if (persons && persons.length > 0) {
          const person = persons[0];

          if (person) {
            updatePerson.id = person.id;

            remarks.push('Person exist already. no updates made');

            //Get contacts
            const [contactErr, contacts] = await to(
              Service.getContacts({
                personId: updatePerson.sysId,
              })
            );

            if (contactErr) {
              const error = { error: contactErr };
              Error.captureStackTrace(error);
              TE(error);
            }

            const contactsRemarks = await _checkAndUpdateContacts(contacts, {
              mapper: mapper,
              email: personData.email,
              phone: personData.mobile,
              personId: updatePerson.sysId,
            });

            remarks.push(...contactsRemarks);
          }
        }
      }

      return {
        ...data,
        remarks,
        updatePerson,
        updateStakeholders,
      };
    }
    const [errPrefix, namePrefixes] = await to(Service.getNamePrefixes());

    if (errPrefix) TE(errPrefix);

    const personInput = mapper.mapUpdatePerson(personData, namePrefixes);

    const [err, result] = await to(Service.updatePerson(personInput));

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

    const updatePerson = {
      id: person.id,
      sysId: person._id,
    };

    return {
      ...data,
      remarks,
      updatePerson,
    };
  } catch (error) {
    const errorStack = mapError(error, ERROR);

    console.error(
      `${processDefinitionKey} | _updatePerson | ${smeLoanRequestId} :`,
      {
        module: 'CRM',
        logData: {
          errorStack: errorStack,
        },
      }
    );

    throw error;
  }
};

const _updateStakeholder = async (data) => {
  const {
    updateCustomer,
    updatePerson,
    updateStakeholders,
    dataSource,
    smeLoanRequestId,
    processDefinitionKey,
  } = data;

  const outputData = {
    ...data,
  };

  const ERROR =
    'STAKEHOLDER update failed; please check STAKEHOLDER relationships yourself';

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

      const stakeholderInput = Mapper(dataSource).mapStakeholder(
        updateCustomer.sysId,
        updatePerson.sysId
      );

      const [err, result] = await to(
        Service.updateStakeholder([stakeholderInput])
      );

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

      outputData.updateStakeholders = stakeholders
        ? stakeholders.map((stakeholder) => ({
          id: stakeholder.id,
          sysId: stakeholder._id,
        }))
        : null;
    }
    return outputData;
  } catch (error) {
    const errorStack = mapError(error, ERROR);

    console.error(
      `${processDefinitionKey} | _updateStakeholder | ${smeLoanRequestId} :`,
      {
        module: 'CRM',
        logData: {
          errorStack: errorStack,
        },
      }
    );

    throw error;
  }
};

const updateCrmSystem = async (data) => {
  const updateCustomerData = await _updateCustomer(data);
  const updatePersonData = await _updatePerson(updateCustomerData);
  const updatedCrmData = await _updateStakeholder(updatePersonData);

  const {
    processIdentifiers,
    updateCustomer,
    customerLegalName,
    updatePerson,
    updateStakeholders,
    remarks,
  } = updatedCrmData;

  const completeUpdateCrmSystemData = {
    businessKey: data.smeLoanRequestId,
    taskDefinitionKey: 'complete-update-crm-system',
    processDefinitionKey: 'loan-initiation',
    variables: {
      customerLegalName: {
        type: 'String',
        value: customerLegalName,
      },
      processIdentifiers: {
        type: 'json',
        value: JSON.stringify(processIdentifiers),
      },
      updateCustomer: {
        type: 'json',
        value: JSON.stringify(updateCustomer),
      },
      updatePerson: {
        type: 'json',
        value: JSON.stringify(updatePerson),
      },
      updateStakeholders: {
        type: 'json',
        value: JSON.stringify(updateStakeholders),
      },
      remarks: {
        type: 'json',
        value: JSON.stringify(remarks),
      },
    },
  };

  console.log('crm update done....................');

  await SQSService.sendMessage(
    completeUpdateCrmSystemData,
    completeTaskQueueUrl
  );
};

module.exports = {
  updateCrmSystem,
};
