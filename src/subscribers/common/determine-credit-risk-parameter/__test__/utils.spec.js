const Utils = require('../utils');

const BankTransactions = require('./mock/bank-transactions.json');

describe('Subscribers -> Common -> Determine-Credit-Risk-Parameter | Utils', () => {

  describe('calAmount', () => {

    it('Should calculate total using default field (amount)', async () => {

      const _500AmountBts = BankTransactions.filter( bt => bt.amount === '500.00' );

      const totalAmount = Utils.calAmount(_500AmountBts);

      expect(_500AmountBts.length*500).toEqual(totalAmount);
    });

    it('Should calculate total using pass parameter, Ex: othersAmount', async () => {

      const _500AmountBts = BankTransactions
        .filter( bt => bt.amount === '500.00' )
        .map(bt => ({ othersAmount: bt.amount }));

      const totalAmount = Utils.calAmount(_500AmountBts, 'othersAmount');

      expect(_500AmountBts.length*500).toEqual(totalAmount);
    });

    it('Should calculate total and total equal 0', async () => {

      const _500AmountBts = [];

      const totalAmount = Utils.calAmount(_500AmountBts);

      expect(_500AmountBts.length*500).toEqual(totalAmount);
    });
  });

  afterAll(async () => {
    //
  });

  afterEach(async () => {

    //
  });
});