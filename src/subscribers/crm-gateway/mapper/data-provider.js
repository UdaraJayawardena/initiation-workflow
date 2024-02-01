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

// const _getArray = (stringVal) => {

//   if (!stringVal) return [];

//   return stringVal.split(',');
// };

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

// const _getLegalForm = (legalForm) => {

//   const lowerCaseLegalForm = _setToLowerCase(legalForm);

//   switch (lowerCaseLegalForm) {
//     case 'besloten vennootschap':
//     case 'besloten vennootschap met gewone structuur':
//       return _setToLowerCase('BV');
//     case 'vennootschap-onder firma': 
//       return 'vof';
//     default:
//       return lowerCaseLegalForm;
//   }
// };

const _getPrimarySbiCode = (chamberOfCommerceProfile) => {

  const businessActivities = chamberOfCommerceProfile.businessActivities;

  const businessActivity = Object.values(businessActivities)
    .find( businessActivity => businessActivity.isMainSbi);

  if (!businessActivity) return '';

  return businessActivity.sbiCode;
};

const _getOtherSbiCode = (chamberOfCommerceProfile) => {

  const businessActivities = chamberOfCommerceProfile.businessActivities;

  return Object.values(businessActivities)
    .filter( businessActivity => !businessActivity.isMainSbi)
    .map( businessActivity => businessActivity.sbiCode);
};

const _mapCustomer = ({chamberOfCommerceProfile, vtigerCrmEntities, dataProviderId}) => ({
  action: 'update',
  dataSource: 'data-provider',
  vTigerAccountNumber: vtigerCrmEntities.vtiger_account_no ,
  legalForm: chamberOfCommerceProfile.legalForm, //Utility.getLegalForm(chamberOfCommerceProfile.legalForm),
  legalName: chamberOfCommerceProfile.tradeNames.businessName,
  status: 'active',
  cocId: chamberOfCommerceProfile.kvkNumber ? chamberOfCommerceProfile.kvkNumber : '',
  dataProviderId: dataProviderId ? dataProviderId : '',
  customerIndicator: 'yes',
  primarySbiCode: _getPrimarySbiCode(chamberOfCommerceProfile),
  otherSbiCode: _getOtherSbiCode(chamberOfCommerceProfile),
  registrationDate: chamberOfCommerceProfile.foundationDate, 
  companyTradeNames: Object.values(chamberOfCommerceProfile.tradeNames.currentTradeNames),
  // latestNameChange: empty
  // latestChangeInChamberOfCommerce: empty
  // kindOfChangeInChamberOfCommerce: empty
  language: 'dutch',
  primaryCustomerSuccessManager: vtigerCrmEntities.accounts_customersuccesmanager,
  googleString: ' http://acceptatie.dganederland.nl/company_check.php?company=%COMPANYNAME%'
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

const _mapPerson = (personData, namePrefixes) => {
  const person = {
    action: 'update',
    dataSource: 'data-provider',
    initials: _getInitials(personData.givenName),
    givenName: _capitalizeFirstLetter(personData.givenName),
    gender: '',
    namePrefix: _mapNamePrefix(personData.surname, namePrefixes),
    surname: _mapSurname(personData.surname, namePrefixes),
    birthDate: '',  //UBO
    genderPartner: '',  //??????
    // given-name-partner = UBO-formulier
    contractNamePartner: '', //see specs domain language
    // birthday-partner = UBO
    // googleString: 'http://acceptatie.dganederland.nl/person_check.php?person=%PERSONNAME%'
  };

  person.contractName = _getContractName(person);


  return person;
};

const mapAddress = (address) => {
  if (!address || address.length === 0) {
    return [];
  }

  const { street, houseNumber, houseNumberAddition, postalCode, city, country } = address[0];

  if (!postalCode || !city || !country) {
    return [];
  }

  return {
    dataSource: 'data-provider',
    action: 'update',
    type: 'physical',
    streetName: street,
    houseNumber,
    houseNumberAddition,
    postalCode,
    cityName: city,
    country,
  };
};

const mapContact = ({ type, value }) => ({
  dataSource: 'data-provider',
  action: 'update',
  status: 'active',
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
  date: moment().format('YYYY-MM-DD'),
  source: 'n.a.',
  indicator: 'n.a.'
});

const _mapCddInfo = () => ({
  action: 'none'
});

const _personIdentity = () => ({
  action: 'none'
});

const mapUpdateCustomer = (customerData) => {

  customerData = JSON.parse(customerData);

  const webSites = customerData.chamberOfCommerceProfile.websites ? 
    customerData.chamberOfCommerceProfile.websites: [];

  return {
    customer: _mapCustomer(customerData),
    address: { data: [mapAddress(customerData.chamberOfCommerceProfile.addresses)] },
    contact: {
      data: [
        mapContact({ type: 'email', value: customerData.customerContact.eMail }),
        mapContact({ type: 'phone', value: customerData.customerContact.phone }),
        ...Object.values(webSites).map(website => mapContact({
          type: 'social', value: website
        }))
        // mapContact({ type: 'social', value: customerData.chamberOfCommerceProfile.websites }),
      ]
    },
    cddInfo: _mapCddInfo(),
    highRiskRegister: _mapHighRiskRegister(),
    systemDate: moment().format('YYYY-MM-DD')
  };
};

const mapUpdatePerson = (person, namePrefixes) => ({
  person: _mapPerson(person, namePrefixes),
  // address: { data: [_mapAddress(contact)] },
  // contact: {
  //   data: [
  //     mapContact({ type: 'email', value: contact.email }),
  //     mapContact({ type: 'phone', value: contact.mobile }),
  //   ]
  // },
  highRiskRegister: _mapHighRiskRegister(),
  stakeholder: {
    action: 'none'
  },
  cddInfo: _mapCddInfo(),
  personIdentity: _personIdentity(),
  systemDate: moment().format('YYYY-MM-DD')
});

const mapStakeholder = (customerId, personId) => ({
  dataSource: 'data-provider',
  action: 'update',
  customerId: customerId,
  personId: personId,
  role: 'unknown',
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

  mapStakeholder
};