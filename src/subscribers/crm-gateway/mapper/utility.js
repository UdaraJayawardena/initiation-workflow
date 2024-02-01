const setToLowerCase = (value) => {

  if (!value) return '';

  return value.toLowerCase();
};

const getLegalForm = (legalForm) => {

  const lowerCaseLegalForm = setToLowerCase(legalForm);

  switch (lowerCaseLegalForm) {
    case 'private':
      return 'private';
    case 'bv':
    case 'besloten vennootschap':
    case 'besloten vennootschap met gewone structuur':
      return 'bv';
    case 'eenmanszaak':
      return 'eenmanszaak';
    case 'vof':
    case 'vennootschap-onder firma':
    case 'Vennootschap onder firma':
      return 'vof';
    case 'maatschap':
      return 'maatschap';
    case 'stak':
      return 'stak';
    default:
      return 'other';
  }
};

module.exports = {
  setToLowerCase: setToLowerCase,
  getLegalForm: getLegalForm
};