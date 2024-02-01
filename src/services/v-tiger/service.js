const axios = require('axios');
const { TE } = require('@src/helper');

const { getUrl, getAuthToken, getCreateData } = require('./utils');

const Service = {

  /**
   * Create recode in bridgefund vtiger
   * @method create
   * @param {String} 'element' element to update
   * @param {String} 'elementType' element type
   * @param {String} 'filePath' file path
   */
  create: async (element, elementType, filePath) => {

    const url = getUrl('create');

    const { data, config } = getCreateData(element, elementType, filePath);

    const response = await axios.default.post(url, data, config);

    const result = response.data;

    if (result.success) return result.result;

    TE(result);
  },

  revise: async (element, elementType) => {

    const url = getUrl('revise');

    const response = await axios.default.post(url, {
      elementType: elementType,
      element: element
    }, {
      headers: { authorization: getAuthToken() }
    });

    const result = response.data;

    if (result.success) return result.result;

    TE(result);
  },

  /**
   * Query tables in bridgefund vtiger
   * @method query
   * @param {String} 'query' sql query
   */
  query: async (query) => {

    const url = getUrl('query');

    const response = await axios.default.get(url, {
      headers: { authorization: getAuthToken() },
      params: { query: query },
    });

    const result = response.data;

    if (result.success) return result.result;

    TE(result);
  }
};

module.exports = Service;
