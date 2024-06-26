const express = require('express');
const v1Router = express.Router();
const userRouter = require('./routes/user.routes');
const mantralekhanRouter = require('./routes/mantralekhan.routes');
const testimonialRouter = require('./routes/testimonial.routes');
const queryRouter = require('./routes/query.routes');
const feedbackRouter = require('./routes/feedback.routes');
const adminRouter = require('./routes/admin.routes');
const UserController = require('../../controllers/user.controller');
v1Router.use('/user', userRouter);
v1Router.use('/mantralekhan', mantralekhanRouter);
v1Router.use('/testimonial', testimonialRouter);
v1Router.use('/query', queryRouter);
v1Router.use('/feedback', feedbackRouter);
v1Router.use('/admin', adminRouter);

v1Router.route('/login/failure').get(UserController.LoginFailure);
v1Router.route('/login/success').get(UserController.isLoggedIn);

module.exports = v1Router;
