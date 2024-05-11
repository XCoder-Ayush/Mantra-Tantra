const express = require('express');
const mantralekhanRouter = express.Router();
const AuthMiddleware = require('../../../middlewares/auth.middleware');
const MantralekhanController = require('../../../controllers/mantralekhan.controller');

mantralekhanRouter
  .route('/')
  .post(AuthMiddleware, MantralekhanController.PostMantralekhan);

mantralekhanRouter.route('/today').get(MantralekhanController.GetTopUsersToday);

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

mantralekhanRouter
  .route('/count')
  .get(MantralekhanController.GetCountOfMantralekhan);

module.exports = mantralekhanRouter;
