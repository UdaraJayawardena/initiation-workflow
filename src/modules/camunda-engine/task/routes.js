const express = require('express');

const controller = require('./controller');

const router = express.Router();

router.route('/claim').post(
  controller.claim
);

router.route('/complete').post(
  controller.complete
);

router.route('/claim-and-complete').post(
  controller.claimAndComplete
);

module.exports = router;