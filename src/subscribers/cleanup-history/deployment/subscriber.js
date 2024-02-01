const { CamundaClientService } = require('../../../services');

const { EngineRestService } = CamundaClientService;

const EXCLUDE_DEPLOYMENT_LIST = [
  'contract-management',
  'store-data-into-crm',
  'sme-loan-request-process',
  'create-contract-cluster',
  'sub-create-contract-cluster',
  'create-contract',
  'update-and-generate-contract',
  'loan-initiation',
  'create-sme-loan-request-cluster',
  'categories-bank-transactions',
  'determine-credit-risk-parameter',
  'sub-determine-credit-risk-parameter',
  'revision-flex-loan',
  'send-revision-announcement',
  'sub-send-revision-announcement',
  'automatically-end-flex-loan-revision',
  'send-approval-revision-message',
  'withdrawal-process'
];

const cleanUpDeploymentHistory = async ({ task, taskService }) => {

  const { deploymentName } = task.variables.getAll();

  try {

    if (!deploymentName) {
      console.error('CleanUpDeploymentHistory FAILED ERROR', 'Invalid Input (deploymentName)', `deploymentName=${deploymentName}`);
      // Complete the external task
      await taskService.complete(task);
      return;
    }

    if (EXCLUDE_DEPLOYMENT_LIST.includes(deploymentName)) {
      console.error('CleanUpDeploymentHistory FAILED ERROR', 'Not Permitted (deploymentName)', `deploymentName=${deploymentName}`);
      // Complete the external task
      await taskService.complete(task);
      return;
    }

    // Retrieve all deployments
    const deployments = await EngineRestService.Deployment.getDeployments({
      name: deploymentName
    });

    // Group deployments by deployment name
    const deploymentsByDeploymentName = deployments.reduce((acc, deployment) => {
      const deploymentName = deployment.name;
      if (!acc[deploymentName] || deployment.deploymentTime > acc[deploymentName].deploymentTime) {
        acc[deploymentName] = deployment;
      }
      return acc;
    }, {});

    // Delete all old deployments for each deployment name
    for (const deploymentName in deploymentsByDeploymentName) {
      const deployment = deploymentsByDeploymentName[deploymentName];
      for (const deploymentToDelete of deployments) {
        const { id, name, deploymentTime, source, tenantId } = deploymentToDelete;
        if (id !== deployment.id && name === deploymentName) {
          await EngineRestService.Deployment.deleteDeployment(id, { cascade: true });
          console.log(`deploymentName=${deploymentName}|id=${id}|source=${source}|tenantId=${tenantId}|deploymentTime=${deploymentTime}`);
        }
      }
    }

    console.log('CleanUpDeploymentHistory SUCCESS', `deploymentName=${deploymentName}`, new Date());

    // Complete the external task
    await taskService.complete(task);

  } catch (error) {
    console.error('CleanUpDeploymentHistory FAILED ERROR', 'Exception (deploymentName)', `deploymentName=${deploymentName}`, error);
    // Complete the external task
    await taskService.complete(task);
  }
};

module.exports = {

  cleanUpDeploymentHistory,
};
