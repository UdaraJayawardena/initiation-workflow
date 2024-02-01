const express = require('express');

const Controller = require('./controller');

const router = express.Router();

router
  .route('/')
  .post(Controller.createList)
  .delete(Controller.deleteList)
  .get(Controller.getList);

router
  .route('/create')
  .post(Controller.create);

router
  .route('/:deploymentId/redeploy')
  .post(Controller.redeploy);

router
  .route('/:deploymentId/resources')
  .get(Controller.getResourceList);

router
  .route('/delete')
  .delete(Controller.del);

module.exports = router;