const { CRMGatewayService } = require('@src/services');

/**
 * 
 * @param {string} customer 
 * @param {boolean} isSkip 
 * @param {object} token 
 * @returns {object} { personHighRiskIndicator, customerHighRiskIndicator }
 */
const checkHighRiskRegister = async (customer, isSkip, token) => {

  const hrIndicators = {
    personHighRiskIndicator: '',
    customerHighRiskIndicator: ''
  };

  if (isSkip) return hrIndicators;

  const cusHighRiskRegister = customer.highRiskRegister;

  if (!cusHighRiskRegister || cusHighRiskRegister.indicator === 'n.a.') {
    hrIndicators.customerHighRiskIndicator = 'green';
  } else {
    hrIndicators.customerHighRiskIndicator = 'orange';
  }

  const stakeholders = await CRMGatewayService.getStakeholders({
    customerId: customer._id
  }, token);

  if (stakeholders.length <= 0) return hrIndicators;

  for (let i = 0; i < stakeholders.length; i++) {
    const stakeholder = stakeholders[i];
    const personDetails = await CRMGatewayService.getPersonAddressesContacts({
      mongoId: stakeholder.personId
    }, token);
  
    if (!personDetails || !personDetails.person) {
      hrIndicators.personHighRiskIndicator = 'orange';
      continue;
    }
  
    const personHighRiskRegister = personDetails.highRiskRegister;
  
    if (!personHighRiskRegister || personHighRiskRegister.indicator === 'n.a.') {
      hrIndicators.personHighRiskIndicator = 'green';
    } else {
      hrIndicators.personHighRiskIndicator = 'orange';
      break;
    }
  }

  return hrIndicators;
};

module.exports = { checkHighRiskRegister };