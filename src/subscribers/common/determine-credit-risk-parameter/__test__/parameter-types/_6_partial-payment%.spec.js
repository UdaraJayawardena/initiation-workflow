const PartialPayment = require('../../parameter-types/_6_partial-payment%');

// const BankTransactions = require('../mock/bank-transactions.json');
const CRPTypes = require('../mock/crp-types.json');
const SmeLoanRequestList = require('../mock/sme-loan-request-list.json');
const SmeLoanRequestBlocks = require('../mock/sme-loan-request-blocks.json');
const BankTransactions = require('../mock/bank-transactions.json');

describe('Subscribers -> Common -> Determine-Credit-Risk-Parameter | Parameter-Types', () => {

  describe('_6_partial-payment% | Generate', () => {

    it('Should generate partial-payment% parameter, value = 3.675240901438633', async () => {

      const smeLoanRequest = SmeLoanRequestList.find(smeLR => smeLR.contractId === 'SBF81660');

      const crpType = CRPTypes.find(crp => crp.type === 'partial-payment%');

      const smeLoanRequestBlock = SmeLoanRequestBlocks[0];

      const creditRiskParameter = await PartialPayment.generate(
        null, 
        smeLoanRequest, 
        crpType,
        smeLoanRequestBlock,
        BankTransactions);

      expect(creditRiskParameter.value).toEqual(3.675240901438633);
      expect(creditRiskParameter.source).toEqual('bank-account');
      expect(creditRiskParameter.turnover).toEqual(undefined);
      expect(creditRiskParameter.type).toEqual(crpType.type);
      expect(creditRiskParameter.smeLoanRequestId).toEqual(smeLoanRequest.id);
      expect(creditRiskParameter.creditRiskParameterTypeId).toEqual(crpType.id);
      expect(creditRiskParameter.bankTransactionId.length).toEqual(520);
    });

    it('Should generate no-of-partial-incoming-payments parameter, value = -1000', async () => {

      const smeLoanRequest = SmeLoanRequestList.find(smeLR => smeLR.contractId === 'SBF81660');

      const crpType = CRPTypes.find(crp => crp.type === 'no-of-partial-incoming-payments');

      const smeLoanRequestBlock = SmeLoanRequestBlocks[0];

      const customBT = [
        { id: 1, 'description': 'deel factuurnummer: 2018-0213', 'amount': '-1000.00',}
      ];

      const creditRiskParameter = await PartialPayment.generate(
        null, 
        smeLoanRequest, 
        crpType,
        smeLoanRequestBlock,
        customBT);

      expect(creditRiskParameter.value).toEqual(100);
      expect(creditRiskParameter.source).toEqual('bank-account');
      expect(creditRiskParameter.turnover).toEqual(undefined);
      expect(creditRiskParameter.type).toEqual(crpType.type);
      expect(creditRiskParameter.smeLoanRequestId).toEqual(smeLoanRequest.id);
      expect(creditRiskParameter.creditRiskParameterTypeId).toEqual(crpType.id);
      expect(creditRiskParameter.bankTransactionId.length).toEqual(1);
    });

    it('Should generate no-of-partial-incoming-payments parameter, value = -2000', async () => {

      const smeLoanRequest = SmeLoanRequestList.find(smeLR => smeLR.contractId === 'SBF81660');

      const crpType = CRPTypes.find(crp => crp.type === 'no-of-partial-incoming-payments');

      const smeLoanRequestBlock = SmeLoanRequestBlocks[0];

      const customBT = [
        { id: 1, 'description': 'deel factuurnummer: 2018-0213', 'amount': '-1000.00',},
        { id: 2, 'description': 'deel factuurnummer: 2018-0213', 'amount': '-1000.00',},
        { id: 3, 'description': 'deel factuurnummer: 2018-0213 voordeel', 'amount': '-1000.00',},
        { id: 3, 'description': 'deel factuurnummer: 2018-0213 voordeel', 'amount': '1000.00',},
        { id: 3, 'description': 'deel factuurnummer: 2018-0213', 'amount': '1000.00',}
      ];

      const creditRiskParameter = await PartialPayment.generate(
        null, 
        smeLoanRequest, 
        crpType,
        smeLoanRequestBlock,
        customBT);

      expect(creditRiskParameter.value).toEqual(33.33333333333333);
      expect(creditRiskParameter.source).toEqual('bank-account');
      expect(creditRiskParameter.turnover).toEqual(undefined);
      expect(creditRiskParameter.type).toEqual(crpType.type);
      expect(creditRiskParameter.smeLoanRequestId).toEqual(smeLoanRequest.id);
      expect(creditRiskParameter.creditRiskParameterTypeId).toEqual(crpType.id);
      expect(creditRiskParameter.bankTransactionId.length).toEqual(3);
    });

  });

  afterAll(async () => {
    //
  });

  afterEach(async () => {

    //
  });
});