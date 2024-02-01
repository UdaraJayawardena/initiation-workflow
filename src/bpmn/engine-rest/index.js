const Authorization  = require('./authorization');

const Deployment  = require('./deployment');

const Group  = require('./group');

const History = require('./history');

const ProcessDefinition  = require('./process-definition');

const ProcessInstance  = require('./process-instance');

const Task  = require('./task');

const Tenant  = require('./tenant');

const User  = require('./user');

const VariableInstance  = require('./variable-instance');

const Migration = require('./migration');

module.exports = {

  Authorization: Authorization,

  Deployment: Deployment,

  Group: Group,

  History: History,

  ProcessDefinition: ProcessDefinition,

  ProcessInstance: ProcessInstance,

  Task: Task,

  Tenant: Tenant,

  User: User,

  VariableInstance: VariableInstance,

  Migration:Migration

};