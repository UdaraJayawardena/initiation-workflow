const express = require('express');

const controller = require('./controller');

const router = express.Router();

router.route('/start-instance-by-key').post(
  controller.startInstanceByKey
);

router.route('/start-instance-by-id').post(
  controller.startInstanceById
);

router.route('/start-instance-by-key-for-tenant').post(
  controller.startInstanceByKeyForTenant
);

module.exports = router;