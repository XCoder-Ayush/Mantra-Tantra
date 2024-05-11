const express = require('express');
const v1Router = express.Router();
const userRouter = require('./routes/user.routes');
const mantralekhanRouter = require('./routes/mantralekhan.routes');
const testimonialRouter = require('./routes/testimonial.routes');

v1Router.use('/user', userRouter);
v1Router.use('/mantralekhan', mantralekhanRouter);
v1Router.use('/testimonial', testimonialRouter);

module.exports = v1Router;
