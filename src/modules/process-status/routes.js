const express = require('express');

const router = express.Router();

const Controller = require('./controller');

router.route('/query')
  .get(Controller.getProcessStatusList)
  .post(Controller.getProcessStatusList);

router.route('/seed')
  .post(Controller.seedProcessStatus);

module.exports = router;