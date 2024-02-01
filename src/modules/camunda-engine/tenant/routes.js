const express = require('express');

const Controller = require('./controller');

const router = express.Router();

router
  .route('/')
  // .post(Controller.createList)
  // .delete(Controller.deleteList)
  .get(Controller.getList);

router
  .route('/create')
  .post(Controller.create);

router
  .route('/seed')
  .post(Controller.seed);

router
  .route('/:tenantId')
  .delete(Controller.del);

module.exports = router;