const { ERROR, SUCCESS, TE} = require('@src/helper');

const { CustomCodes } = require('./constants');

const { Migration, ProcessInstance } = require('../../../bpmn').EngineRest;

const versionOne = async (req, res) => {
  
  try {    

    if (!req.body.sourceProcessDefinitionId) TE(CustomCodes.ERR_SOURCE_PROCESS_DEFINITION_ID_NOT_FOUND);
    if (!req.body.targetProcessDefinitionId) TE(CustomCodes.ERR_TARGET_PROCESS_DEFINITION_ID_NOT_FOUND);
    if (!req.body.updateEventTriggers) TE(CustomCodes.ERR_EVENT_TRIGGER_NOT_FOUND);

    const generateResponse = await Migration.generate(req.body, req.camundaAuth);
 
    if(generateResponse){

      const validateResponse = await Migration.validate(generateResponse, req.camundaAuth);
  
      if(validateResponse.instructionReports.length == 0){

        const processInstanceRes = await ProcessInstance.processInstance(req.body.sourceProcessDefinitionId, req.camundaAuth);
        
        if(processInstanceRes.length == 0 ) TE(CustomCodes.PROCESS_INSTANCE_EMPTY);
        
        if(processInstanceRes.length > 0){
          const executeObj = {
            'migrationPlan': generateResponse,
            'processInstanceIds': processInstanceRes.map(PI => (PI.id)),
            'processInstanceQuery': {
              'processDefinitionId': req.body.sourceProcessDefinitionId
            },
            'skipCustomListeners': true,
            'skipIoMappings': false
          }; 
          
          await Migration.execute(executeObj, req.camundaAuth);
         
          SUCCESS(res, CustomCodes.SUCCESS, CustomCodes.SUCCESS_MESSAGE, req.requestId);
        }
      }else{
        TE(CustomCodes.VALIDATION_ERROR);
      }
    }else{
      TE(CustomCodes.GENERATE_ERROR);
    }    
  }
  catch (error) {
    
    ERROR(res, error, req.requestId);
  }
};

const migration = async (req, res) => {
  
  try {  
    
    const processKeyArray = [];
    let keysDP ='';

    if(req.body.keys.length == 0){
      const getProcessDefinitions = await Migration.getProcessDefinitions(req.camundaAuth);

      const keyArray = getProcessDefinitions.map(pd => pd.key);
      keysDP = keyArray.filter((data,index) => { return keyArray.indexOf(data) === index; }); // remove duplicate values
    }else{
      keysDP = req.body.keys;
    }
    
    for(let x = 0; x < keysDP.length; x++){           
      let targetDefinitionId = '';
      let processKey = '';
      const getPDVersions = await Migration.getProcessDefinitionsByKey(`?key=${keysDP[x]}`, req.camundaAuth);
      
      if(getPDVersions.length > 1){
       
        getPDVersions.sort((a, b) => {
          return a.version - b.version;
        });        
     
        targetDefinitionId = getPDVersions[getPDVersions.length - 1].id; // get last definition id
        processKey = getPDVersions[getPDVersions.length - 1].key;

        getPDVersions.splice(getPDVersions.length - 1);        
  
        for(let i = 0; i < getPDVersions.length; i++){ // remove last one and run loop          
          
          const sourceDefinitionId = getPDVersions[i].id;         

          const processInstanceRes = await ProcessInstance.processInstance(sourceDefinitionId, req.camundaAuth);
          
          if(processInstanceRes.length > 0){

            processKeyArray.push(processKey);
            
            const dataObj = {
              sourceProcessDefinitionId: sourceDefinitionId,
              targetProcessDefinitionId: targetDefinitionId,
              updateEventTriggers: true
            };         
            
            const generateResponse = await Migration.generate(dataObj, req.camundaAuth);
          
            if(generateResponse){

              const validateResponse = await Migration.validate(generateResponse, req.camundaAuth);
            
              if(validateResponse.instructionReports.length == 0){                                                
              
                const executeObj = {
                  'migrationPlan': generateResponse,
                  'processInstanceIds': processInstanceRes.map(PI => (PI.id)),
                  'processInstanceQuery': {
                    'processDefinitionId': sourceDefinitionId
                  },
                  'skipCustomListeners': true,
                  'skipIoMappings': false
                }; 
                      
                await Migration.execute(executeObj, req.camundaAuth);                    
                
              }
            }
          }           
        }       
      }
    }
    
   
    CustomCodes.SUCCESS_MESSAGE.migrateFlows = processKeyArray.filter((data,index) => { return processKeyArray.indexOf(data) === index; });
    SUCCESS(res, CustomCodes.SUCCESS, CustomCodes.SUCCESS_MESSAGE, req.requestId);
   
  }catch (error) {
  
    ERROR(res, error, req.requestId);
  }
};

module.exports = {
  migration,
  versionOne
};
