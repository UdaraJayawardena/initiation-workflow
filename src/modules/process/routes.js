const express = require('express');

const router = express.Router();

const Controller = require('./controller');

router.route('/query')
  .get(Controller.getProcessList)
  .post(Controller.getProcessList);

router.route('/seed')
  .post(Controller.seedProcess);

module.exports = router;