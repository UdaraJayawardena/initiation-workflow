const { CRMGatewayService } = require('@src/services');

const VALID_LEGAL_FORM = ['eenmanszaak', 'bv', 'vof', 'maatschap'];

/**
 * STEP 2: Check legal-form
 * 
 * @param {string} customerId 
 * @param {object} token token config object { reqId, authToken }
 * @returns {object} { legalFormIndicator, isSkipStep03, customer, customerHighRiskRegister }
 */
const checkLegalForm = async (customerId, token) => {

  let legalFormIndicator = '';
  let isSkipStep03 = false;
  

  const customerDetails = await CRMGatewayService.getCustomerDetails({
    customerId: customerId
  }, token);

  if (!customerDetails || !customerDetails.customer) {
    legalFormIndicator = 'orange',
    isSkipStep03 = true;
    return { legalFormIndicator, isSkipStep03 };
  }

  const { customer } = customerDetails;

  if (VALID_LEGAL_FORM.includes(customer.legalForm)) {
    legalFormIndicator = 'green';
  } else {
    legalFormIndicator = 'red';
  }

  customer.highRiskRegister = customerDetails.highRiskRegister;

  return {
    legalFormIndicator,
    isSkipStep03,
    customer
  };
};

module.exports = { checkLegalForm };