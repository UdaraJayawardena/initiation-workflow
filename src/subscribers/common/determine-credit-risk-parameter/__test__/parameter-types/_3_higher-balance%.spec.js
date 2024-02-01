const HigherBalance = require('../../parameter-types/_3_higher-balance%');

// const BankTransactions = require('../mock/bank-transactions.json');
const CRPTypes = require('../mock/crp-types.json');
const SmeLoanRequestList = require('../mock/sme-loan-request-list.json');
const SmeLoanRequestBlocks = require('../mock/sme-loan-request-blocks.json');
const BankAccountDailyPosition = require('../mock/bank-account-daily-position.json');

const Service = require('@src/services/bai-management/bank-account-daily-position');

const Helper = require('@src/helper');

jest.mock('@src/services/bai-management/bank-account-daily-position');
jest.mock('@src/helper');

describe('Subscribers -> Common -> Determine-Credit-Risk-Parameter | Parameter-Types', () => {

  beforeAll(() => {
    Service.getBankAccountDailyPosition
      .mockImplementation(() => Promise.resolve(BankAccountDailyPosition));
    Helper.getToken.mockImplementation(() => { return {}; });
  });

  describe('_3_higher-balance% | Generate', () => {

    it('Should generate higher-balance% parameter', async () => {

      const smeLoanRequest = SmeLoanRequestList.find(smeLR => smeLR.contractId === 'SBF81660');

      const crpType = CRPTypes.find(crp => crp.type === 'higher-balance%');

      const smeLoanRequestBlock = SmeLoanRequestBlocks[0];

      const creditRiskParameter = await HigherBalance.generate(
        null, 
        smeLoanRequest, 
        crpType,
        smeLoanRequestBlock);

      const dailyCollectionAmount = smeLoanRequest.desiredDirectDebitAmount;

      const dpLength = BankAccountDailyPosition
        .filter( dp => parseFloat(dp.balance_amount) > dailyCollectionAmount).length;

      expect(creditRiskParameter.value).toEqual((dpLength/BankAccountDailyPosition.length)*100);
      expect(creditRiskParameter.source).toEqual('bank-account');
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