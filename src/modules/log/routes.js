const express = require('express');

const router = express.Router();

const Controller = require('./controller');

router.route('/query')
  .get(Controller.getLogs)
  .post(Controller.getLogs);

module.exports = router;