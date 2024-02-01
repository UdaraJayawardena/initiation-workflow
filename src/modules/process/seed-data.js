module.exports = [
  {
    name: 'Contract Management',
    key: 'contract-management',
    businessKey: {
      name: 'contractId',
      placeholder: 'Contract Id',
      hint: 'SBFXXXXX'
    },
    identifiers: [{
      name: 'customer Legal Name',
      apiIn: 'customerLegalName'
    }],
    status: 'active'
  },
  {
    name: 'Update Bank',
    key: 'update-bank',
    businessKey: {
      name: 'action',
      placeholder: 'Action',
      hint: 'BNK-CREATE / BNK-UPDATE'
    },
    identifiers: [],
    status: 'active'
  },
  {
    name: 'Update Platform Parameter',
    key: 'update-platform-parameter',
    businessKey: {
      name: 'action',
      placeholder: 'Action',
      hint: 'PP-CREATE / PP-UPDATE'
    },
    identifiers: [],
    status: 'active'
  },
  {
    name: 'Loan Initiation',
    key: 'loan-initiation',
    businessKey: {
      name: 'contractId',
      placeholder: 'Contract Id',
      hint: 'SBFXXXXX'
    },
    identifiers: [],
    status: 'active'
  },
  {
    name: 'Revision Flex Loan',
    key: 'revision-flex-loan',
    businessKey: {
      name: 'contractId',
      placeholder: 'Contract Id',
      hint: 'SBFXXXXX'
    },
    identifiers: [],
    status: 'active'
  },
  {
    name: 'Revision Flex Loan (Scheduler)',
    key: 'revision-flex-loan-scheduler',
    // businessKey: {
    //   name: 'contractId',
    //   placeholder: 'Contract Id',
    //   hint: 'SBFXXXXX'
    // },
    identifiers: [],
    status: 'active'
  },
  {
    name: 'Revision Flex Loan (Simulation)',
    key: 'revision-flex-loan-simulation',
    // businessKey: {
    //   name: 'contractId',
    //   placeholder: 'Contract Id',
    //   hint: 'SBFXXXXX'
    // },
    identifiers: [],
    status: 'active'
  },
];