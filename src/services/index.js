const InitiationManagement = require('./initiation-management');
const BaiManagement = require('./bai-management');
const CamundaClient = require('./camunda-client');
const VTiger = require('./v-tiger');
const CRMGateway = require('./crm-gateway');
const Configurations = require('./configurations');
const LoanManagement = require('./loan-management');
const Notifications = require('./notification');
const Authentication = require('./authentication');
const CrmManagement = require('./crm-management');
const AutomatedAnalysis = require('./automated-analysis');
const AWSService = require('./aws');

module.exports = {
  InitiationManagementService: InitiationManagement,
  BaiManagementService: BaiManagement,
  CamundaClientService: CamundaClient,
  VTigerService: VTiger,
  CRMGatewayService: CRMGateway,
  ConfigurationsService: Configurations,
  LoanManagement: LoanManagement,
  Notifications: Notifications,
  AuthenticationService: Authentication,
  CrmManagementService: CrmManagement,
  AutomatedAnalysis: AutomatedAnalysis,
  AWSService: AWSService
};