const TurnOver = require('../../parameter-types/_2_turn-over');

// const BankTransactions = require('../mock/bank-transactions.json');
const CRPTypes = require('../mock/crp-types.json');
const SmeLoanRequestList = require('../mock/sme-loan-request-list.json');
const SmeLoanRequestBlocks = require('../mock/sme-loan-request-blocks.json');
const BankTransactions = require('../mock/bank-transactions.json');

const { calAmount, btFilterBySubCategory } = require('../../utils');

describe('Subscribers -> Common -> Determine-Credit-Risk-Parameter | Parameter-Types', () => {

  describe('_2_turn-over | Generate', () => {

    it('Should generate turn-over parameter', async () => {

      const smeLoanRequest = SmeLoanRequestList.find(smeLR => smeLR.contractId === 'SBF81660');

      const crpType = CRPTypes.find(crp => crp.type === 'turn-over');

      const smeLoanRequestBlock = SmeLoanRequestBlocks[0];

      const revenueBts = btFilterBySubCategory(BankTransactions, 'REVENUE');

      smeLoanRequestBlock.turnover= calAmount(revenueBts);

      const creditRiskParameter = await TurnOver.generate(
        null, 
        smeLoanRequest, 
        crpType,
        smeLoanRequestBlock,
        BankTransactions);

      expect(creditRiskParameter.value).toEqual(smeLoanRequestBlock.turnOver);
      expect(creditRiskParameter.source).toEqual('bank-account');
      expect(creditRiskParameter.turnover).toEqual(undefined);
      expect(creditRiskParameter.type).toEqual(crpType.type);
      expect(creditRiskParameter.smeLoanRequestId).toEqual(smeLoanRequest.id);
      expect(creditRiskParameter.creditRiskParameterTypeId).toEqual(crpType.id);
      expect(creditRiskParameter.bankTransactionId.length).toEqual(revenueBts.length);
    });

  });

  afterAll(async () => {
    //
  });

  afterEach(async () => {

    //
  });
});