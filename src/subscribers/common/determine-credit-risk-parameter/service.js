const { to, TE, getToken } = require('@src/helper');

const { BaiManagementService, InitiationManagementService } = require('../../../services');

const getDebtsAndDebtorsCreditors = async (params, task) => {

  const { DebtorCreditor } = InitiationManagementService;

  const [err, debtorsCreditors] = await to(DebtorCreditor.getDebtsAndDebtorsCreditors({
    requestId: params.id,
    requestContractId: params.contractId
  }, getToken(task)));

  if (err) {
    const error = { error: err };
    Error.captureStackTrace(error);
    TE(error);
  }

  if (!debtorsCreditors) {
    const error = { error: 'Debts-And-Debtors-Creditors not found' };
    Error.captureStackTrace(error);
    TE(error);
  }

  return debtorsCreditors;
};

const createCreditRiskParameterList = async (data, task) => {

  const { CreditRiskParameterService } = InitiationManagementService;

  const [err, result] = await to(CreditRiskParameterService
    .createCreditRiskParameterList(data, getToken(task)));

  if (err) {
    const error = { error: err };
    Error.captureStackTrace(error);
    TE(error);
  }

  if (!result) {
    const error = { error: 'Create credit-risk-parameter not found' };
    Error.captureStackTrace(error);
    TE(error);
  }

  return result;
};

const updateSmeLoanRequestBlocks = async (id, data, task) => {

  const { SmeLoanRequestTransactionBlockService } = BaiManagementService;

  const [err, result] = await to(SmeLoanRequestTransactionBlockService
    .updateSmeLoanRequestBlocks(id, data, getToken(task)));

  if (err) {
    const error = { error: err };
    Error.captureStackTrace(error);
    TE(error);
  }

  if (!result) {
    const error = { error: 'Update sme-loan-request-block not found' };
    Error.captureStackTrace(error);
    TE(error);
  }

  return result;
};

module.exports = {
  // getBankAccountDailyPosition,
  getDebtsAndDebtorsCreditors,
  createCreditRiskParameterList,
  updateSmeLoanRequestBlocks
};