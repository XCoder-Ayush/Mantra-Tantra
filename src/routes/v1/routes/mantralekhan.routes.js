const express = require('express');
const mantralekhanRouter = express.Router();
const AuthMiddleware = require('../../../middlewares/auth.middleware');
const MantralekhanController = require('../../../controllers/mantralekhan.controller');

mantralekhanRouter
  .route('/:userId')
  .post(MantralekhanController.PostMantralekhan);

mantralekhanRouter
  .route('/week')
  .get(MantralekhanController.GetTopUsersThisWeek);

mantralekhanRouter
  .route('/month')
  .get(MantralekhanController.GetTopUsersThisMonth);

mantralekhanRouter
  .route('/year')
  .get(MantralekhanController.GetTopUsersThisYear);

mantralekhanRouter
  .route('/alltime')
  .get(MantralekhanController.GetTopUsersAllTime);

module.exports = mantralekhanRouter;
