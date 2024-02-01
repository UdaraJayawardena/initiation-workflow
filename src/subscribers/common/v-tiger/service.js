const moment = require('moment');

const crypto = require('crypto');

const qs = require('querystring');

const axios = require('@src/axios');

const { V_TIGER } = require('@config').Config;

const fs = require('fs');

const BASE_URL = V_TIGER.baseUrl;

const ACCESS_KEY = V_TIGER.accessKey;

const USER_NAME = V_TIGER.userName;

const AUTH_ERROR = {

  success: false,

  error: {

    code: 'INVALID_SESSIONID',

    message: 'Session Identifier provided is Invalid'
  }
};

const header = {

  'content-type': 'application/x-www-form-urlencoded',
  'authorization': `Basic ${Buffer.from(USER_NAME + ':' + ACCESS_KEY).toString('base64')}`
};

const  _hashCode = (string)=> {

  const hashCode = crypto.createHash('md5')
  
    .update(string).digest('hex');

  return hashCode;
};

let sessionObj = null;

/*get main url from configurations*/
const getUrl = (operation, queryParams) => {

  let url = `${BASE_URL}/${getMiddleUrl(operation)}`;

  if(queryParams && queryParams.length > 0){
        
    queryParams.forEach( param => url = url + `&${param.key}=${param.value}`);
  }

  return url;
};

/*get middle Url*/
const getMiddleUrl = (operation) => {

  if(operation) {
    if (operation === 'reopen') {
      return `/restapi/v1/vtiger/default/${operation}`;
    }

    return `webservice.php?operation=${operation}`;
  }

  return 'webservice.php';
};

const getData = (operation, element, elementType, filePath) => {

  const data = {

    operation: operation,

    sessionName: sessionObj.sessionName,

    element: element,
  };

  if(elementType) data.elementType = elementType;

  if(filePath) data.filename = fs.createReadStream(filePath);

  return data;
};

// const getOptions = (service, params, options) => {

//   if(options && options.header) Object.assign(options.header, header);

//   return {
      
//     mockServer: {

//       name: 'BRIDGE_FUND',

//       service: service,

//       params: params
//     },

//     json: true,

//     ...options
//   };
// };

const getExpireTime = ({serverTime, expireTime}) => {
  
  const mServerTime = moment(serverTime);
  const mExpireTime = moment(expireTime);

  const diff = mExpireTime.diff(mServerTime)*1000;

  const currentTime = new Date().getTime();

  const newExpireTime = moment(currentTime+diff);

  const expireDate = moment(newExpireTime.format());

  // console.log(diff, expireDate.format('YYYY-MM-DD HH.mm.ss'));

  return expireDate.subtract(1, 'm');
};

/*Api call for get authentication token*/
const challenge = async () => {

  const challengeUrl = getUrl('getchallenge', [{ key: 'username', value: USER_NAME }]);
    
  const resultChallenge = await axios.get(challengeUrl);
    
  const { token } = resultChallenge.result;

  return {
    accessKey: _hashCode(`${token}${ACCESS_KEY}`),
    expireTime: getExpireTime(resultChallenge.result)
  };
};

/*handle authentication*/
const authentication = async () => {

  const { accessKey, expireTime } = await challenge();

  const data = {

    operation:'login',

    username: USER_NAME,

    accessKey: accessKey
  };

  const resultlogin = await axios.post(getUrl(), qs.stringify(data), {
    headers: { 'content-type': 'application/x-www-form-urlencoded' }
  });

  if(resultlogin.error) throw resultlogin;

  sessionObj = resultlogin.result;

  Object.assign(sessionObj, {expireTime: expireTime });

  return { 

    success: true,

    result: sessionObj
  };
};

/*Check validity of the session*/
const isValidSession = () => {

  if(!sessionObj){

    return false;
  }

  const expireTime = moment(sessionObj.expireTime);

  const isValied = moment().isBefore(expireTime);

  return isValied;
};

const checkIsValidSession = async () => {

  const isValid = isValidSession();   

  if(!isValid){

    return await authentication();
  }

  return { success: true, result: sessionObj };
};

const Service = {

  /**
   * Create recode in bridgefund vtiger
   * @method create
   * @param {String} 'element' element to update
   * @param {String} 'elementType' element type
   * @param {String} 'filePath' file path
   */
  create: async (element, elementType, filePath) => {

    try{

      // console.log('CREATE');

      const authResult = await checkIsValidSession();

      if(authResult && authResult.success){

        const data = getData('create', JSON.stringify(element), elementType, filePath);

        // const options = getOptions('CREATE', data, {formData: data});

        // console.log(getUrl(), options);

        return await axios.post(getUrl(), data);
      }

      throw AUTH_ERROR;

    } catch (error) {

      return new Error(error);
    }
  },

  /**
   * retrieve recode in bridgefund vtiger
   * @method retrieve
   * @param {String} 'id' recode id
   */
  retrieve: async (id) => {

    // try{

    // console.log('RETRIVE');

    const authResult = await checkIsValidSession();

    if(authResult && authResult.success){

      const queryParams = [

        { key: 'sessionName', value: sessionObj.sessionName },
  
        { key: 'id', value: id }
      ];

      const data = getData('retrieve', JSON.stringify({ id: id}));

      // const options = getOptions('RETRIEVE', data);
  
      const retrieveUrl = getUrl('retrieve', queryParams );

      // console.log(retrieveUrl, options);
      
      const result = await axios.get(retrieveUrl, data);

      // console.log('***********************',result);

      return result;
    }

    throw AUTH_ERROR;

    // } catch (error) {

    //   throw error;
    // }
  },

  /**
   * retrieve document in bridgefund vtiger
   * @method retrieveDocument
   * @param {String} 'id' document id
   */
  retrieveDocument: async (id) => {

    // try{

    const authResult = await checkIsValidSession();

    if(authResult && authResult.success){

      const queryParams = [

        { key: 'sessionName', value: sessionObj.sessionName },

        { key: 'id', value: id }
      ];

      // const data = getData('files_retrieve', JSON.stringify({ id: id}));

      // const options = getOptions('FILE_RETRIEVE', data);

      const retrieveUrl = getUrl('files_retrieve', queryParams );

      // console.log(retrieveUrl, options);

      const result = await axios.get(retrieveUrl);

      // console.log('***********************',result);

      return result;
    }

    throw AUTH_ERROR;

    // } catch (error) {

    //   throw error;
    // }
  },

  /**
   * update recode in bridgefund vtiger
   * @method update
   * @param {Object} 'element' elements need to update
   */
  update: async (element) => {
    // try{

    // console.log('QUERY');

    const authResult = await checkIsValidSession();

    if(authResult && authResult.success){

      const data = getData('update', JSON.stringify(element));

      // const options = getOptions('UPDATE', data, {formData: data});

      // console.log(getUrl(), options);

      const resultUpdate = await axios.post(getUrl(), data);

      return resultUpdate;
    }

    throw AUTH_ERROR;

    // } catch (error) {

    //   throw error;
    // }
  },

  /**
   * update recode in bridgefund vtiger
   * @method revise
   * @param {Object} 'element' elements need to update
   */
  revise: async (element) => {
    // try{

    // console.log('UPDATE');

    const authResult = await checkIsValidSession();

    if(authResult && authResult.success){

      const data = getData('revise', JSON.stringify(element));

      // const options = getOptions('UPDATE', data, {formData: data});

      // console.log(getUrl(), options);

      const resultUpdate = await axios.post(getUrl(), data);

      return resultUpdate;
    }

    throw AUTH_ERROR;

    // } catch (error) {

    //   throw error;
    // }
  },

  /**
   * Query tables in bridgefund vtiger
   * @method query
   * @param {String} 'query' sql query
   */
  query: async (query) => {

    const authResult = await checkIsValidSession();

    if(authResult && authResult.success){

      const queryParams = [

        { key: 'sessionName', value: sessionObj.sessionName },
  
        { key: 'query', value: query }
      ];
  
      const retrieveUrl = getUrl('query', queryParams );
      
      return await axios.get(retrieveUrl);
    }

    throw AUTH_ERROR;
  },

  /**
   * reopen closed record in bridgefund vtiger
   * @method revise
   * @param {String} 'recordId' Record that needs to be reopened
   */
  reopen: async (recordId) => {
    // try{

    const authResult = await checkIsValidSession();

    if(authResult && authResult.success){

      const options = {
        headers: header,
        url: getUrl('reopen'),
        body: `id=${recordId}`
      };

      const resultUpdate = await axios.post(getUrl('reopen'), options);

      return resultUpdate;
    }

    throw AUTH_ERROR;

    // } catch (error) {

    //   throw error;
    // }
  },

  getUserId: async () => {

    // try{

    // console.log('GET USER ID');

    const authResult = await checkIsValidSession();

    if(authResult && authResult.success){

      return { 
        
        success: true, 
        
        result: { userId: sessionObj.userId } 
      };
    }

    throw AUTH_ERROR;

    // } catch (error) {

    //   throw error;
    // }
  }

};

module.exports = Service;
