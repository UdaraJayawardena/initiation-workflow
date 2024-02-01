const moment = require('moment');

// const Utility = require('./utility');

const _newRegex = (pattern) => new RegExp(pattern);

const _matchPattern = (value, expression) => {

  if (!value || !expression) return null;

  const matchValue = expression.exec(value);

  if (matchValue && matchValue.length > 0) {

    return matchValue[0];
  }

  return null;
};

// const _setToLowerCase = (value) => {

//   if(!value) return '';

//   return value.toLowerCase();
// };

const _setToUpperCase = (value) => {

  if(!value) return '';

  return value.toUpperCase();
};

const _getFirstLetter = (value) => {

  if(!value) return '';

  return _setToUpperCase(value.charAt(0));
};

const _capitalizeFirstLetter = (value) => {

  if (!value) return '';

  value = value.trim();

  return value.replace(/^./, _getFirstLetter(value));
};

const _getArray = (stringVal) => {

  if (!stringVal) return [];

  return stringVal.split(',');
};

const _getInitials = (value) => {

  if(!value) return '';

  const nameArray = value.split(' ');

  return nameArray.reduce( (initials, val) => {

    const firstLetter = _getFirstLetter(val);

    return `${initials}${_getFirstLetter(firstLetter)}.`;
  } , '');
};

const _getContractName = (person) => {

  const { initials, namePrefix, surname } = person;

  return `${initials} ${namePrefix} ${surname}`;
};

// const _getLegalForm = (cf_accounts_legal) => {

//   const lowerCaseLeganForm = _setToLowerCase(cf_accounts_legal);

//   switch (lowerCaseLeganForm) {
//     case 'besloten vennootschap':
//     case 'besloten vennootschap met gewone structuur':
//       return _setToLowerCase('BV');
//     default:
//       return lowerCaseLeganForm;
//   }
// };

const _getPrimarySbiCode = (cfAccountsSbiCodes) => {

  const sbiCodes = _getArray(cfAccountsSbiCodes);

  if (sbiCodes.length <= 0) return '';

  return sbiCodes[0];
};

const _getOtherSbiCode = (cfAccountsSbiCodes) => {

  const sbiCodes = _getArray(cfAccountsSbiCodes);

  if (sbiCodes.length <= 1) return [];

  sbiCodes.splice(0, 1);

  return sbiCodes;
};

const _mapCustomer = (organization) => ({
  action: 'update',
  dataSource: 'v-tiger',
  vTigerAccountNumber: organization.account_no,
  legalForm: organization.cf_accounts_legal, //Utility.getLegalForm(organization.cf_accounts_legal),
  legalName: organization.accountname,
  status: 'active',
  cocId: organization.cf_accounts_chamberofcommercenumber ? organization.cf_accounts_chamberofcommercenumber : '',
  dataProviderId: organization.cf_accounts_dataproviderid ? organization.cf_accounts_dataproviderid : '',
  customerIndicator: 'yes',
  primarySbiCode: _getPrimarySbiCode(organization.cf_accounts_sbicodes),
  otherSbiCode: _getOtherSbiCode(organization.cf_accounts_sbicodes),
  registrationDate: moment().format('YYYY-MM-DD'), // Empty (Story mention empty, but this is required field)
  companyTradeNames: _getArray(organization.cf_accounts_tradenames),
  language: 'dutch',
  primaryCustomerSuccessManager: organization.cf_accounts_customersuccesmanager,
  googleString: organization.cf_contacts_googlecompliancecheck
});

const _getNamePrefixExpression = (namePrefixes) => {
  const pattern = namePrefixes
    .reduce((pattern, value) => `${pattern}(^${value})|`, '');
  return _newRegex(pattern.slice(0, -1));
};

const _mapNamePrefix = (lastName, namePrefixes) => {

  const expression = _getNamePrefixExpression(namePrefixes);

  const value = _matchPattern(lastName, expression);

  if(!value) return '';

  return value;
};

const _mapSurname = (lastName, namePrefixes) => {

  if(!lastName) return '';

  const expression = _getNamePrefixExpression(namePrefixes);

  const surname = lastName.replace(expression, '');

  return _capitalizeFirstLetter(surname);
};

const _mapPerson = (contact, namePrefixes) => {
  const person = {
    action: 'update',
    dataSource: 'v-tiger',
    initials: _getInitials(contact.firstname),
    givenName: _capitalizeFirstLetter(contact.firstname),
    gender: '',
    namePrefix: _mapNamePrefix(contact.lastname, namePrefixes),
    surname: _mapSurname(contact.lastname, namePrefixes),
    birthDate: '',  //UBO
    genderPartner: '',  //??????
    // given-name-partner = UBO-formulier
    contractNamePartner: '', //see specs domain language
    // birthday-partner = UBO

    // high-risk-register-source = n.a.
    // high-risk-register-indicator = n.a.
    // cdd-info-document = empty
    // person-identity-type = empty
    // person-identity-document = empty
  };

  person.contractName = _getContractName(person);


  return person;
};

const mapAddress = (organization) => ({
  dataSource: 'v-tiger',
  // customer-id = see above
  // person-id = empty
  action: 'update',
  type: 'physical',
  streetName: organization.bill_street,
  houseNumber: organization.bill_pobox,
  postalCode: organization.bill_code,
  cityName: organization.bill_city,
  country: organization.bill_country
  // start-date = empty
  // end-date = empty
});

const mapContactAddress = (contact) =>  ({
  dataSource: 'v-tiger',
  // customer-id = see above
  // person-id = empty
  action: 'update',
  type: 'physical',
  country: contact.mailingcountry,
  streetName: contact.mailingstreet,
  houseNumber: contact.mailingpobox,
  postalCode: contact.mailingzip,
  cityName: contact.mailingcity,
  // start-date = empty
  // end-date = empty
});

const mapContact = ({ type, value }) => ({
  action: 'update',
  status: 'active',
  dataSource: 'v-tiger',
  type: type,
  subType: 'work',
  value: value,
  // createdAt: null,
  // endDate: null,
  // startDate: null,
  // updatedAt: null
});

const _mapHighRiskRegister = () => ({
  action: 'create',
  date: '2020-07-30',
  source: 'n.a.',
  indicator: 'n.a.'
});

const _mapCddInfo = () => ({
  action: 'none'
});

const _personIdentity = () => ({
  action: 'none'
});

const mapUpdateCustomer = (organization) => ({
  customer: _mapCustomer(organization),
  address: { data: [mapAddress(organization)] },
  contact: {
    data: [
      mapContact({ type: 'email', value: organization.email1 }),
      mapContact({ type: 'phone', value: organization.phone }),
    ]
  },
  cddInfo: _mapCddInfo(),
  highRiskRegister: _mapHighRiskRegister(),
  systemDate: '2020-09-08'
});

const mapUpdatePerson = (contact, namePrefixes) => ({
  person: _mapPerson(contact, namePrefixes),
  // address: { data: [_mapAddress(contact)] },
  contact: {
    data: [
      mapContact({ type: 'email', value: contact.email }),
      mapContact({ type: 'phone', value: contact.mobile }),
    ]
  },
  highRiskRegister: _mapHighRiskRegister(),
  stakeholder: {
    action: 'none'
  },
  cddInfo: _mapCddInfo(),
  personIdentity: _personIdentity(),
  systemDate: '2020-09-08'
});

const mapStakeholder = (customerId, personId) => ({
  action: 'update',
  customerId: customerId,
  personId: personId,
  dataSource: 'vTiger',
  role: 'Managing Director',
  // startDate = empty
  // end-date = empty
  signingContractIndicator: 'yes',
  signingGuaranteeIndicator: 'yes',
  sharePercentage: 0
});

module.exports = {

  mapAddress,

  mapContact,

  mapUpdateCustomer,

  mapUpdatePerson,

  mapStakeholder,

  mapContactAddress
};