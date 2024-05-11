const express = require('express');
const feedbackRouter = express.Router();
const AuthMiddleware = require('../../../middlewares/auth.middleware');
const FeedbackController = require('../../../controllers/feedback.controller');

feedbackRouter.route('/').post(AuthMiddleware, FeedbackController.PostFeedback);

module.exports = feedbackRouter;
