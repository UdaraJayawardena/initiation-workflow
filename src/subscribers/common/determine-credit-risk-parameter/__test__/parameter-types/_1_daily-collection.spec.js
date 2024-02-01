const DailyCollection = require('../../parameter-types/_1_daily-collection');

// const BankTransactions = require('../mock/bank-transactions.json');
const CRPTypes = require('../mock/crp-types.json');
const SmeLoanRequestList = require('../mock/sme-loan-request-list.json');

describe('Subscribers -> Common -> Determine-Credit-Risk-Parameter | Parameter-Types', () => {

  describe('_1_daily-collection | Generate', () => {

    it('Should generate daily-collection parameter', async () => {

      const smeLoanRequest = SmeLoanRequestList.find(smeLR => smeLR.contractId === 'SBF81660');

      const crpType = CRPTypes.find(crp => crp.type === 'daily-collection');

      const creditRiskParameter = await DailyCollection.generate(null, smeLoanRequest, crpType);

      expect(creditRiskParameter.value).toEqual(smeLoanRequest.desiredDirectDebitAmount);
      expect(creditRiskParameter.source).toEqual('loan-initiation');
      expect(creditRiskParameter.turnover).toEqual(undefined);
      expect(creditRiskParameter.type).toEqual(crpType.type);
      expect(creditRiskParameter.smeLoanRequestId).toEqual(smeLoanRequest.id);
      expect(creditRiskParameter.creditRiskParameterTypeId).toEqual(crpType.id);
    });

  });

  afterAll(async () => {
    //
  });

  afterEach(async () => {

    //
  });
});