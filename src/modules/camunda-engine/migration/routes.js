const express = require('express');

const controller = require('./controller');

const router = express.Router();

router.route('/').post(
  controller.migration
);

router.route('/v1').post(
  controller.versionOne
);

module.exports = router;