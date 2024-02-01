// const express = require('express');

// const Middleware = require('./middleware');

// const { AuthRoutes } = require('./authorization');

// const { DeployementRoutes } = require('./deployement');

// const { ProcessDefinitionRoutes } = require('./process-definitions');

// const { TaskRoutes } = require('./task');

// // const { TenantRoutes } = require('./tenant');

// const { MigrationRoutes } = require('./migration');

// const router = express.Router();

// router.use(
//   Middleware.createRequestId,
//   Middleware.bindSpanWithRequest,
//   Middleware.bindAuthTokenToVariables,
// );

// router.use('/authorization', AuthRoutes);

// router.use('/deployments', DeployementRoutes);

// router.use('/process-definitions', ProcessDefinitionRoutes);

// router.use('/task', TaskRoutes);

// Temporary commented by Lasantha
// router.use('/tenants', TenantRoutes);

// router.use('/migration', MigrationRoutes);

// module.exports = router;