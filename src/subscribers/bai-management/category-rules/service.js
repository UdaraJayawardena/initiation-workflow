const axios = require('@src/axios');

const { Config } = require('@config');

const { baseUrl } = Config.BAI_MANAGEMENT;

const categoryRulesURL = `${baseUrl}/category-rules`;

const createCategoryRule = async (data, headerToken) => {

  const result = await axios.post(`${categoryRulesURL}/`,
    data, headerToken);

  return result.data;
};

const updateCategoryRule = async (data, headerToken) => {

  const result = await axios.put(`${categoryRulesURL}/`,
    data, headerToken);

  return result.data;
};

const deleteCategoryRule = async (ruleId, headerToken) => {

  const result = await axios.del(`${categoryRulesURL}/byId/${ruleId}`,
    headerToken);

  return result.data;
};

module.exports = {
  createCategoryRule,

  updateCategoryRule,

  deleteCategoryRule,
};