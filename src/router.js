const express = require('express');

const router = express.Router();

const Start = require('./start');

const { Auth } = require('./auth');

const { LogRoutes } = require('./modules/log');

const { ProcessRoutes } = require('./modules/process');

const { ProcessStatusRoutes } = require('./modules/process-status');

const { initRoute, initSpan, storeDocuments, _404, _500 } = require('./init');

const init = initRoute('Awesome :-), crm-workflow server is working properly ');

router.route('/').get(init);

router.use(initSpan);

// Check is valid end point
router.use(Auth.isAuthorized);

router.use('/logs', LogRoutes);

router.use('/processes', ProcessRoutes);

router.use('/processes/status', ProcessStatusRoutes);

router.post('/key/:key/start', storeDocuments, Start);

// 404 - Route not found
router.use(_404);

// 500 - Any server error
router.use(_500);

module.exports = router;
